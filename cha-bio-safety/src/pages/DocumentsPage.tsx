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

  const tabBtnClass = (active: boolean) =>
    active ? 'docs-tab-btn docs-tab-btn-active' : 'docs-tab-btn'

  return (
    <div className="docs-page-root">
      {!isDesktop && (
        <div className="docs-mobile-wrap">
          <div className="docs-tab-bar">
            <button type="button" onClick={() => setActiveTab('plan')} className={tabBtnClass(activeTab === 'plan')}>
              소방계획서
            </button>
            <button type="button" onClick={() => setActiveTab('drill')} className={tabBtnClass(activeTab === 'drill')}>
              소방훈련자료
            </button>
          </div>

          <DocumentSection type={activeTab} onUploadClick={() => setUploadFor(activeTab)} />
        </div>
      )}

      {isDesktop && (
        <div className="docs-desktop-grid">
          <div className="docs-desktop-col">
            <DocumentSection type="plan" onUploadClick={() => setUploadFor('plan')} />
          </div>
          <div className="docs-desktop-col">
            <DocumentSection type="drill" onUploadClick={() => setUploadFor('drill')} />
          </div>
        </div>
      )}

      {/* Upload shell */}
      {uploadFor !== null && !isDesktop && (
        <div
          className="docs-upload-sheet"
          onClick={() => {
            /* backdrop no-op — user must use 취소 button so confirm guard fires */
          }}
        >
          <div onClick={(e) => e.stopPropagation()} className="docs-upload-sheet-body">
            <div className="docs-sheet-handle" />
            <DocumentUploadForm type={uploadFor} onClose={() => setUploadFor(null)} />
          </div>
        </div>
      )}

      {uploadFor !== null && isDesktop && (
        <div
          className="docs-upload-modal"
          onClick={() => {
            /* backdrop no-op — user must use 취소 button so confirm guard fires */
          }}
        >
          <div onClick={(e) => e.stopPropagation()} className="docs-upload-modal-body">
            <DocumentUploadForm type={uploadFor} onClose={() => setUploadFor(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
