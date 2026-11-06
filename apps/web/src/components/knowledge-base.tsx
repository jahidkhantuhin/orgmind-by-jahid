'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  OrganizationDocumentsResponseSchema,
  type DocumentSummary,
  type MembershipRole,
} from '@orgmind/shared';
import { ThemeToggle } from './theme-toggle';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(status: DocumentSummary['status']): string {
  switch (status) {
    case 'uploaded':
      return 'Queued';
    case 'parsing':
      return 'Processing';
    case 'chunking':
      return 'Chunking';
    case 'embedding':
      return 'Embedding';
    case 'parsed':
      return 'Ready';
    case 'failed':
      return 'Failed';
  }
}

export function KnowledgeBase({
  organizationId,
  organizationName,
  role,
}: {
  organizationId: string;
  organizationName: string;
  role: MembershipRole;
}) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canManage = role === 'admin' || role === 'member';

  const refreshDocuments = useCallback(async () => {
    const response = await fetch(
      `${apiUrl}/organizations/${encodeURIComponent(organizationId)}/documents`,
      { credentials: 'include', cache: 'no-store' },
    );
    if (!response.ok) throw new Error('Unable to load documents. Please refresh the page.');
    const result = OrganizationDocumentsResponseSchema.parse(await response.json());
    setDocuments(result.documents);
  }, [organizationId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/organizations/${encodeURIComponent(organizationId)}/documents`,
          { credentials: 'include', cache: 'no-store' },
        );
        if (!response.ok) throw new Error('Unable to load documents. Please refresh the page.');
        const result = OrganizationDocumentsResponseSchema.parse(await response.json());
        if (active) setDocuments(result.documents);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load documents.');
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 2_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [organizationId]);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch(
        `${apiUrl}/organizations/${encodeURIComponent(organizationId)}/documents`,
        { method: 'POST', credentials: 'include', body: form },
      );
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? (payload.error as { message?: string }).message
            : undefined;
        throw new Error(message ?? 'Upload failed. Please try again.');
      }
      setNotice(`${file.name} was uploaded and added to the processing queue.`);
      await refreshDocuments();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function removeDocument(document: DocumentSummary) {
    if (!window.confirm(`Delete “${document.originalName}”?`)) return;
    setError('');
    const response = await fetch(
      `${apiUrl}/organizations/${encodeURIComponent(organizationId)}/documents/${encodeURIComponent(document.id)}`,
      { method: 'DELETE', credentials: 'include' },
    );
    if (!response.ok) {
      setError('Unable to delete this document. Please try again.');
      return;
    }
    setDocuments((current) => current.filter((item) => item.id !== document.id));
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    void upload(event.currentTarget.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload(event.dataTransfer.files[0]);
  }

  return (
    <main className="knowledge-page">
      <header className="knowledge-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">O</span>
          <span>
            orgmind<span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="knowledge-top-actions">
          <ThemeToggle className="knowledge-theme-toggle" />
          <Link className="knowledge-back" href="/">
            ← Workspace
          </Link>
        </div>
      </header>
      <section className="knowledge-content">
        <p className="eyebrow">{organizationName.toUpperCase()}</p>
        <div className="knowledge-heading">
          <div>
            <h1>Knowledge base</h1>
            <p>Bring your team&apos;s documents together in one searchable workspace.</p>
          </div>
          <span className="date-chip">
            {documents.length} {documents.length === 1 ? 'DOCUMENT' : 'DOCUMENTS'}
          </span>
        </div>

        {canManage && (
          <div
            className={`upload-dropzone${dragging ? ' is-dragging' : ''}${busy ? ' is-busy' : ''}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                setDragging(false);
            }}
            onDrop={onDrop}
          >
            <div className="upload-icon">↑</div>
            <h2>{busy ? 'Uploading your document…' : 'Drop a document to add it'}</h2>
            <p>PDF, DOCX, Markdown, or TXT · up to 10 MB</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              className="visually-hidden"
              type="file"
              accept=".pdf,.docx,.md,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain"
              onChange={onFileInput}
            />
          </div>
        )}

        {error && (
          <p className="knowledge-message error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="knowledge-message success" role="status">
            {notice}
          </p>
        )}

        <section className="documents-card" aria-label="Documents">
          <div className="documents-card-heading">
            <div>
              <h2>Documents</h2>
              <p>Upload and processing status updates automatically.</p>
            </div>
            <span>{documents.length} total</span>
          </div>
          {documents.length === 0 ? (
            <div className="documents-empty">
              <div className="empty-file-icon">▤</div>
              <strong>No documents yet</strong>
              <p>Upload a team document to get your knowledge base started.</p>
            </div>
          ) : (
            <div className="document-table-wrap">
              <table className="document-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Size</th>
                    <th>Added</th>
                    <th>Status</th>
                    {canManage && (
                      <th>
                        <span className="visually-hidden">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <div className="document-name">
                          <span className="document-file-icon">
                            {document.extension.toUpperCase()}
                          </span>
                          <div>
                            <Link
                              className="document-open"
                              href={`/knowledge/${encodeURIComponent(document.id)}`}
                            >
                              {document.originalName}
                            </Link>
                            <small>Workspace document</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatSize(document.sizeBytes)}</td>
                      <td>{new Date(document.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`document-status status-${document.status}`}
                          title={document.failureReason}
                        >
                          {statusLabel(document.status)}
                        </span>
                      </td>
                      {canManage && (
                        <td>
                          <button
                            className="document-delete"
                            type="button"
                            onClick={() => void removeDocument(document)}
                            aria-label={`Delete ${document.originalName}`}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
