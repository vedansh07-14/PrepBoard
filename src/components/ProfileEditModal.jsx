import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, User, School, GraduationCap, Loader2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function ProfileEditModal({ isOpen, onClose }) {
  const { user, userData, updateData, uploadFile } = useAuth();
  const [name, setName] = useState(userData.profile?.name || '');
  const [college, setCollege] = useState(userData.profile?.college || '');
  const [year, setYear] = useState(userData.profile?.year || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user.photoURL || '');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const url = await uploadFile(file, `profiles/${user.uid}`);
      await updateData({ photoURL: url }); // Update firestore
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateData({
        profile: { name, college, year }
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad', 'Other'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans text-text">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[24px]" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg glass-panel-strong rounded-[2.5rem] overflow-hidden shadow-2xl border-border"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-text tracking-tight">Edit Profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-surface-2 rounded-full transition-colors text-text-muted">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl border-2 border-primary/30 overflow-hidden bg-primary/5 flex items-center justify-center relative shadow-inner">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-primary">{(name || 'U').charAt(0).toUpperCase()}</span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" ref={fileInputRef} onChange={handleFileChange} 
                  accept="image/*" className="hidden" 
                />
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Update Photo</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary/50 transition-all text-text font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">College</label>
                <div className="relative group">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" required value={college} onChange={e => setCollege(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-primary/50 transition-all text-text font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Year</label>
                <div className="grid grid-cols-3 gap-2">
                  {years.map(y => (
                    <button
                      key={y} type="button" onClick={() => setYear(y)}
                      className={cn(
                        'py-2.5 rounded-lg text-[10px] font-black transition-all border uppercase tracking-widest',
                        year === y 
                          ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                          : 'bg-surface text-text-muted border-border hover:bg-surface-2 hover:text-text'
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" disabled={loading || uploading}
                className="w-full btn-primary text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 uppercase tracking-[0.2em] text-xs"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
