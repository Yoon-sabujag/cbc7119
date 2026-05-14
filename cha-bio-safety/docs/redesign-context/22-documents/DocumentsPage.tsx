// src/pages/DocumentsPage.tsx
//
// /documents route container.
// Mobile (<1024px): tab bar switches a single DocumentSection between plan/drill.
// Desktop (≥1024px): two DocumentSections side-by-side in a max-1200px container.
// Owns upload sheet/modal shell; BottomSheet on mobile, Modal on desktop.
// Backdrop click is a no-op — users must use the form's 취소 button
// (so the beforeunload/confirm guard fires while uploading).

import { useState } from 'react'
import { useIsDesktop } from '../hooks/useIsDesktop'
import DocumentSection from '../components/DocumentSection'
import DocumentUploadForm from '../components/DocumentUploadForm'

type DocType = 'plan' | 'drill'

export default function DocumentsPage() {
  const isDesktop = useIsDesktop()
  const [activeTab, setActiveTab] = useState<DocType>('plan')
  const [uploadFor, setUploadFor] = useState<DocType | null>(null)

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    height: 44,
    background: 'transparent',
    color: active ? 'var(--t1)' : 'var(--t2)',
    fontSize: 16,
    fontWeight: active ? 600 : 400,
    border: 'none',
    borderBottom: active ? '2px solid #2f81f7' : '2px solid transparent',
    cursor: 'pointer',
  })

  return (
    <div style={{ color: 'var(--t1)' }}>
      <style>{`
        @keyframes docs-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes docs-fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {!isDesktop && (
        <div style={{ padding: '16px 16px 0 16px' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              background: 'var(--bg)',
              borderBottom: '1px solid var(--bd)',
              marginBottom: 16,
            }}
          >
            <button type="button" onClick={() => setActiveTab('plan')} style={tabBtnStyle(activeTab === 'plan')}>
              소방계획서
            </button>
            <button type="button" onClick={() => setActiveTab('drill')} style={tabBtnStyle(activeTab === 'drill')}>
              소방훈련자료
            </button>
          </div>

          <DocumentSection type={activeTab} onUploadClick={() => setUploadFor(activeTab)} />
        </div>
      )}

      {isDesktop && (
        <div
          style={{
            display: 'flex',
            gap: 48,
            maxWidth: 1200,
            margin: '0 auto',
            padding: 24,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <DocumentSection type="plan" onUploadClick={() => setUploadFor('plan')} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DocumentSection type="drill" onUploadClick={() => setUploadFor('drill')} />
          </div>
        </div>
      )}

      {/* Upload shell */}
      {uploadFor !== null && !isDesktop && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => {
            /* backdrop no-op — user must use 취소 button so confirm guard fires */
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--bg2)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 24,
              animation: 'docs-slide-up 240ms ease-out',
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: 'var(--bd2)',
                borderRadius: 2,
                margin: '0 auto 16px auto',
              }}
            />
            <DocumentUploadForm type={uploadFor} onClose={() => setUploadFor(null)} />
          </div>
        </div>
      )}

      {uploadFor !== null && isDesktop && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'docs-fade-in 180ms ease-out',
          }}
          onClick={() => {
            /* backdrop no-op — user must use 취소 button so confirm guard fires */
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(480px, 92vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--bg2)',
              border: '1px solid var(--bd2)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <DocumentUploadForm type={uploadFor} onClose={() => setUploadFor(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
