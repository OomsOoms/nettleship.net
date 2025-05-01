"use client"

import type React from "react"

import { useState, useRef } from "react"
import AvatarEditor from "react-avatar-editor"
import Button from "@components/ui/Button"
import Modal from "@components/ui/Modal"
import "../styles/AvatarUpload.scss"

interface AvatarUploadProps {
  currentAvatarUrl: string
  onAvatarChange: (avatarBlob: Blob) => void // Pass the avatar Blob to the parent
}

const AvatarUpload = ({ currentAvatarUrl, onAvatarChange }: AvatarUploadProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [scale, setScale] = useState(1)
  const editorRef = useRef<AvatarEditor>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0])
    }
  }

  const handleSave = async () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas()
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (blob) {
        onAvatarChange(blob) // Pass the Blob to the parent
        closeModal()
      }
    }
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setImage(null)
  }

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        <img
          src={currentAvatarUrl || "/placeholder.svg"}
          alt="Profile"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "https://via.placeholder.com/100?text=User"
          }}
        />
        <Button className="edit-button" onClick={openModal}>
          Edit
        </Button>
      </div>

      <Modal show={isModalOpen} onClose={closeModal}>
        <div className="modal-header">
          <h3>Edit Profile Picture</h3>
        </div>

        <div>
          <div className="editor-container">
            {image ? (
              <AvatarEditor
                ref={editorRef}
                image={image}
                width={250}
                height={250}
                border={50}
                borderRadius={125}
                color={[0, 0, 0, 0.6]}
                scale={scale}
                rotate={0}
              />
            ) : (
              <div className="upload-placeholder">
                <p>Select an image to upload</p>
              </div>
            )}
          </div>

          <div className="upload-controls">
            <label htmlFor="file-upload" className="file-label">
              Upload Image
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          {image && (
            <div className="zoom-controls">
              <label htmlFor="zoom">Zoom: {scale.toFixed(1)}x</label>
              <input
                id="zoom"
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number.parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button className="button secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button className="button primary" onClick={handleSave} disabled={!image}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default AvatarUpload