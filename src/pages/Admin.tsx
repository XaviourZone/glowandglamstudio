import React, { useState, useEffect } from 'react';
import { ShieldCheck, UploadCloud, CheckCircle2, AlertCircle, Loader2, Package, Image as ImageIcon, Settings2, Plus, Trash2, Save, ArrowLeft, FolderOpen, FileEdit, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/Layout';
import initialPackagesData from '../data/packages.json';

const TARGET_FOLDERS = [
  'src/assets',
  'src/assets/images/icons',
  'src/assets/images',
  'src/assets/images/about',
  'src/assets/images/bridal',
  'src/assets/images/engagement',
  'src/assets/images/hairstyling',
  'src/assets/images/hero',
  'src/assets/images/party',
  'src/assets/images/portfolio-featured',
  'src/assets/images/reception',
  'src/assets/images/model-photoshoot',
];

export default function AdminUpload() {
  // Auth State
  const [token, setToken] = useState('');
  const [targetBranch] = useState('main');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'images' | 'packages'>('dashboard');
  
  // --- ASSET MANAGER STATE ---
  const [assetView, setAssetView] = useState<'menu' | 'upload' | 'manage'>('menu');
  
  // Upload State
  const [folder, setFolder] = useState(TARGET_FOLDERS[0]);
  const [uploadFolderAssets, setUploadFolderAssets] = useState<any[]>([]);
  const [uploadFiles, setUploadFiles] = useState<{file: File, customName: string}[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Manage State
  const [manageFolder, setManageFolder] = useState(TARGET_FOLDERS[0]);
  const [existingAssets, setExistingAssets] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [editingAssetSha, setEditingAssetSha] = useState<string | null>(null);
  const [editAssetName, setEditAssetName] = useState('');

  // --- PACKAGE MANAGER STATE ---
  const [packages, setPackages] = useState(initialPackagesData.packages);
  const [pkgStatus, setPkgStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [pkgMessage, setPkgMessage] = useState('');
  const [expandedPackageIndex, setExpandedPackageIndex] = useState<number | null>(null);

  // --- AUTHENTICATION ---
  const handleCheckToken = async () => {
    if (!token) return;
    setIsTokenValid(null);
    try {
      const res = await fetch(`https://api.github.com/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsTokenValid(res.ok);
    } catch (err) {
      setIsTokenValid(false);
    }
  };

  const fetchUploadFolderAssets = () => {
    if (isTokenValid !== true) return;
    fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/${folder}?ref=${targetBranch}&t=${Date.now()}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' },
      cache: 'no-store'
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setUploadFolderAssets(Array.isArray(data) ? data : []))
    .catch(() => setUploadFolderAssets([]));
  };

  useEffect(() => {
    if (currentView === 'images' && assetView === 'upload' && isTokenValid === true) {
      fetchUploadFolderAssets();
    }
  }, [folder, currentView, assetView, isTokenValid, targetBranch]);

  // --- ASSET MANAGER HANDLERS ---
  const processImageToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1600;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height *= MAX_SIZE / width));
              width = MAX_SIZE;
            } else {
              width = Math.round((width *= MAX_SIZE / height));
              height = MAX_SIZE;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to webp, slice off the data:image/webp;base64, prefix
            const dataUrl = canvas.toDataURL('image/webp', 0.85);
            resolve(dataUrl.split(',')[1]);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image for processing'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const sectionName = folder.split('/').pop() || 'image';
      
      let maxPrefix = 0;
      uploadFolderAssets.forEach((asset: any) => {
        const match = asset.name.match(/^(\d+)-/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxPrefix) maxPrefix = num;
        }
      });
      
      const newFiles = Array.from(e.target.files).map((f, i) => {
        const isImage = f.type.startsWith('image/');
        const ext = f.name.split('.').pop()?.toLowerCase();
        
        const nextPrefix = String(maxPrefix + i + 1).padStart(2, '0');
        
        let customName = f.name;
        if (isImage) {
          customName = `${nextPrefix}-${sectionName}-look.webp`;
        } else {
          customName = `${nextPrefix}-${sectionName}-look.${ext}`;
        }
        
        return {
          file: f,
          customName: customName
        };
      });
      setUploadFiles([...uploadFiles, ...newFiles]); // Append instead of replace to allow multiple selections
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpdateCustomName = (index: number, name: string) => {
    const newFiles = [...uploadFiles];
    newFiles[index].customName = name;
    setUploadFiles(newFiles);
  };

  const handleRemoveUploadFile = (index: number) => {
    setUploadFiles(uploadFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTokenValid !== true || uploadFiles.length === 0) return;

    setStatus('uploading');
    let successCount = 0;
    let failCount = 0;
    let lastError = '';

    for (let i = 0; i < uploadFiles.length; i++) {
      const item = uploadFiles[i];
      setMessage(`Processing & Uploading ${i + 1} of ${uploadFiles.length}: ${item.customName}...`);

      try {
        let base64String = '';
        if (item.file.type.startsWith('image/')) {
          base64String = await processImageToWebP(item.file);
        } else {
          base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(item.file);
          });
        }
        
        let safeFilename = item.customName.replace(/\s+/g, '-');
        const ext = item.file.type.startsWith('image/') ? 'webp' : item.file.name.split('.').pop();
        if (ext && !safeFilename.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
          safeFilename += `.${ext}`;
        }
        
        const response = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/${folder}/${safeFilename}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Admin Upload: Add ${safeFilename} to ${folder}`,
            content: base64String,
            branch: targetBranch
          })
        });

        const data = await response.json();
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          if (response.status === 422) lastError = `"${safeFilename}" already exists.`;
          else lastError = data.message || 'Unknown error.';
        }
      } catch (err: any) {
        failCount++;
        lastError = err.message;
      }
    }

    if (failCount === 0) {
      setStatus('success');
      setMessage(`Successfully uploaded ${successCount} asset${successCount > 1 ? 's' : ''}! (Note: Changes take 1-3 minutes to appear on the live website.)`);
      setUploadFiles([]); 
    } else {
      setStatus('error');
      setMessage(`Uploaded ${successCount}, Failed ${failCount}. Last error: ${lastError}`);
    }
  };

  // Fetch Existing Assets
  const fetchAssets = async () => {
    if (isTokenValid !== true) return;
    setIsLoadingAssets(true);
    setExistingAssets([]);
    setStatus('idle');
    setMessage('');
    
    try {
      const response = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/${manageFolder}?ref=${targetBranch}&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setExistingAssets(Array.isArray(data) ? data.filter((item: any) => item.type === 'file') : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    if (currentView === 'images' && assetView === 'manage' && isTokenValid === true) {
      fetchAssets();
    }
  }, [manageFolder, currentView, assetView, isTokenValid, targetBranch]);

  const handleDeleteAsset = async (asset: any) => {
    if (!window.confirm(`Are you sure you want to delete ${asset.name}? This cannot be undone.`)) return;
    setStatus('uploading');
    setMessage(`Deleting ${asset.name}...`);
    try {
      const res = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/${asset.path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Admin: Delete ${asset.name}`,
          sha: asset.sha,
          branch: targetBranch
        })
      });
      if (res.ok) {
        setStatus('success');
        setMessage(`Deleted ${asset.name} successfully. (Note: Changes take 1-3 minutes to appear on the live website.)`);
        fetchAssets();
      } else {
        const err = await res.json();
        setStatus('error');
        setMessage(`Failed to delete: ${err.message}`);
      }
    } catch(e: any) {
      setStatus('error');
      setMessage(e.message);
    }
  };

  const handleRenameAsset = async (asset: any) => {
    if (!editAssetName || editAssetName === asset.name) {
      setEditingAssetSha(null);
      return;
    }
    
    setStatus('uploading');
    setMessage(`Renaming ${asset.name} to ${editAssetName}... This may take a moment for large files.`);
    
    try {
      // 1. Fetch file as blob
      const rawRes = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/${asset.path}?ref=${targetBranch}&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3.raw' },
        cache: 'no-store'
      });
      if (!rawRes.ok) throw new Error('Failed to fetch original file content.');
      const blob = await rawRes.blob();
      
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read file for renaming'));
        reader.readAsDataURL(blob);
      });

      // 2. PUT new file
      let safeFilename = editAssetName.replace(/\s+/g, '-');
      const ext = asset.name.split('.').pop();
      if (ext && !safeFilename.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
        safeFilename += `.${ext}`;
      }

      const putRes = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/${manageFolder}/${safeFilename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Admin: Rename ${asset.name} to ${safeFilename}`,
          content: base64String,
          branch: targetBranch
        })
      });
      
      if (putRes.ok) {
        // 3. DELETE old file
        await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/${asset.path}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Admin: Delete old ${asset.name} after rename`,
            sha: asset.sha,
            branch: targetBranch
          })
        });
        
        setStatus('success');
        setMessage('Renamed successfully. (Note: Changes take 1-3 minutes to appear on the live website.)');
        setEditingAssetSha(null);
        fetchAssets();
      } else {
        const err = await putRes.json();
        throw new Error(err.message);
      }
    } catch(e: any) {
      setStatus('error');
      setMessage(`Rename failed: ${e.message}`);
    }
  };

  // --- PACKAGE MANAGER HANDLERS ---
  const fetchPackagesData = async () => {
    if (isTokenValid !== true) return;
    setPkgStatus('saving');
    setPkgMessage('Fetching latest packages from GitHub...');
    try {
      const getRes = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/src/data/packages.json?ref=${targetBranch}&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' },
        cache: 'no-store'
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        // Decode base64 content
        const decodedContent = decodeURIComponent(escape(atob(getData.content)));
        const parsed = JSON.parse(decodedContent);
        if (parsed.packages) {
          setPackages(parsed.packages);
          setPkgStatus('success');
          setPkgMessage('Packages refreshed successfully.');
        }
      } else {
        setPkgStatus('error');
        setPkgMessage('Failed to fetch latest packages.');
      }
    } catch (e: any) {
      setPkgStatus('error');
      setPkgMessage(e.message);
    }
  };

  const handleSavePackages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTokenValid !== true) return;

    setPkgStatus('saving');
    try {
      const getRes = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/src/data/packages.json?ref=${targetBranch}&t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' },
        cache: 'no-store'
      });
      const getData = await getRes.json();
      let sha = '';
      if (getRes.ok) sha = getData.sha;

      const jsonStr = JSON.stringify({ packages }, null, 2);
      const base64String = btoa(new TextEncoder().encode(jsonStr).reduce((data, byte) => data + String.fromCharCode(byte), ''));

      const putRes = await fetch(`https://api.github.com/repos/XaviourZone/glowandglamstudio/contents/src/data/packages.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Admin: Update packages.json`,
          content: base64String,
          sha: sha || undefined,
          branch: targetBranch
        })
      });

      const putData = await putRes.json();
      if (putRes.ok) {
        setPkgStatus('success');
        setPkgMessage('Packages successfully saved! (Note: Changes take 1-3 minutes to appear on the live website.)');
      } else {
        setPkgStatus('error');
        setPkgMessage(`Failed to save: ${putData.message}`);
      }
    } catch (err: any) {
      setPkgStatus('error');
      setPkgMessage(err.message);
    }
  };

  const updatePackage = (index: number, field: string, value: any) => {
    const newPackages = [...packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setPackages(newPackages);
  };

  const updateFeature = (pkgIndex: number, featIndex: number, value: string) => {
    const newPackages = [...packages];
    const newFeatures = [...newPackages[pkgIndex].features];
    newFeatures[featIndex] = value;
    newPackages[pkgIndex] = { ...newPackages[pkgIndex], features: newFeatures };
    setPackages(newPackages);
  };

  const addFeature = (pkgIndex: number) => {
    const newPackages = [...packages];
    newPackages[pkgIndex] = { ...newPackages[pkgIndex], features: [...newPackages[pkgIndex].features, 'New Feature'] };
    setPackages(newPackages);
  };

  const removeFeature = (pkgIndex: number, featIndex: number) => {
    const newPackages = [...packages];
    const newFeatures = newPackages[pkgIndex].features.filter((_, i) => i !== featIndex);
    newPackages[pkgIndex] = { ...newPackages[pkgIndex], features: newFeatures };
    setPackages(newPackages);
  };
  
  const addPackage = () => {
    setPackages([...packages, {
      id: `new-package-${Date.now()}`,
      name: "New Package",
      tier: "Standard",
      price: "₹0",
      note: "Starting price",
      featured: false,
      features: ["New Feature"],
      whatsapp: "Hi Glow %26 Glam! I'm interested in the New Package."
    }]);
    setExpandedPackageIndex(packages.length);
  };
  
  const removePackage = (index: number) => {
    if(window.confirm('Are you sure you want to delete this package?')) {
      const newPackages = packages.filter((_, i) => i !== index);
      setPackages(newPackages);
      setExpandedPackageIndex(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start px-4 md:px-6 py-12">
      <Reveal className="w-full max-w-5xl">
        <div className="bg-[#161310]/95 border border-primary/30 rounded-2xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden min-h-[500px]">
          {/* Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="w-14 h-14 mx-auto bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-display text-3xl font-light text-foreground tracking-wide">
              Studio Administration
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-light max-w-lg mx-auto">
              Manage website assets, packages, and content. Changes are securely committed to the codebase via GitHub.
            </p>
          </div>

          {/* Token Input (Shared across all views) */}
          <div className="relative z-10 mb-10 max-w-lg mx-auto">
            <label className="text-xs font-medium text-foreground/80 uppercase tracking-widest pl-1 flex items-center justify-between mb-2">
              <span>GitHub Personal Access Token</span>
              <button 
                type="button"
                onClick={() => setShowTokenHelp(!showTokenHelp)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                title="How to get a token?"
              >
                <Info className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest hidden sm:inline-block">Help</span>
              </button>
            </label>
            
            {showTokenHelp && (
              <div className="mb-4 bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="text-primary font-medium mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Generating a GitHub Token</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs">
                  <li>Go to your GitHub account settings.</li>
                  <li>Navigate to <strong>Developer settings</strong> {'>'} <strong>Personal access tokens</strong> {'>'} <strong>Tokens (classic)</strong>.</li>
                  <li>Click <strong>Generate new token (classic)</strong>.</li>
                  <li>Give it a descriptive note (e.g., "Studio Admin Dashboard").</li>
                  <li>Under scopes, you <strong>must check the <code>repo</code> checkbox</strong> (Full control of repositories).</li>
                  <li>Click Generate, copy the token, and paste it below.</li>
                </ol>
                <p className="mt-3 text-[10px] text-primary/70">Never share this token publicly.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => { setToken(e.target.value); setIsTokenValid(null); }}
                className="flex-1 h-12 bg-black/40 border border-border/50 rounded-lg px-4 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all font-mono"
                required
              />
              <Button type="button" onClick={handleCheckToken} disabled={!token} className="h-12 px-6">
                Check
              </Button>
            </div>
            {isTokenValid === true && <p className="text-xs text-green-400 mt-2 pl-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Token is valid for main branch!</p>}
            {isTokenValid === false && <p className="text-xs text-red-400 mt-2 pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Invalid token or network error.</p>}
          </div>

          {/* --- DASHBOARD VIEW --- */}
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              <button onClick={() => { setCurrentView('images'); setAssetView('menu'); }} className="bg-black/30 border border-border/40 p-6 rounded-2xl hover:border-primary/60 hover:bg-black/50 transition-all text-left group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Asset Manager</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">Upload, organize, rename, and delete images and videos across the website.</p>
              </button>
              
              <button onClick={() => setCurrentView('packages')} className="bg-black/30 border border-border/40 p-6 rounded-2xl hover:border-primary/60 hover:bg-black/50 transition-all text-left group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Package Manager</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">Edit package names, prices, features, and tiers for the booking section.</p>
              </button>
              
              <button disabled className="bg-black/10 border border-border/20 p-6 rounded-2xl text-left opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-4">
                  <Settings2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Content Manager</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">Coming Soon. Edit website text, hero sections, and general site settings.</p>
              </button>
            </div>
          )}

          {/* Sub-view Header (Back button) */}
          {currentView !== 'dashboard' && (
            <div className="relative z-10 mb-8 max-w-4xl mx-auto border-b border-border/30 pb-4 flex justify-between items-center">
              <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          )}

          {/* --- TAB: ASSET MANAGER --- */}
          {currentView === 'images' && (
            <div className="relative z-10 max-w-4xl mx-auto">
              
              {/* Asset Manager Sub-Menu */}
              {assetView === 'menu' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-xl font-display text-foreground">Asset Manager</h2>
                    <p className="text-sm text-muted-foreground mt-1">Choose how you want to manage your files.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <button onClick={() => setAssetView('upload')} className="bg-black/40 border border-border/40 p-8 rounded-xl hover:border-primary/50 transition-all flex flex-col items-center justify-center text-center group">
                      <UploadCloud className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-medium text-foreground">Upload New Asset</h3>
                      <p className="text-xs text-muted-foreground mt-2">Add optimized images or videos to a specific gallery section.</p>
                    </button>
                    <button onClick={() => setAssetView('manage')} className="bg-black/40 border border-border/40 p-8 rounded-xl hover:border-primary/50 transition-all flex flex-col items-center justify-center text-center group">
                      <FolderOpen className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-medium text-foreground">Manage Existing Assets</h3>
                      <p className="text-xs text-muted-foreground mt-2">View, rename, or delete existing files.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Asset Manager: Upload View */}
              {assetView === 'upload' && (
                <form onSubmit={handleUpload} className="space-y-6 max-w-xl mx-auto">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAssetView('menu')} className="text-muted-foreground hover:bg-transparent pl-0">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <h2 className="text-lg font-display text-foreground">Upload New Asset</h2>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={fetchUploadFolderAssets} className="h-8 border-border/50 text-muted-foreground hover:text-foreground">
                      <RefreshCw className="w-3 h-3 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground/80 uppercase tracking-widest pl-1">Destination Folder</label>
                    <select value={folder} onChange={(e) => { setFolder(e.target.value); setUploadFiles([]); }} className="w-full h-12 bg-black/40 border border-border/50 rounded-lg px-4 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all appearance-none cursor-pointer">
                      {TARGET_FOLDERS.map((f) => <option key={f} value={f} className="bg-[#120F0D]">{f}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground/80 uppercase tracking-widest pl-1">Image Files</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 hover:border-primary/50 transition-all group relative overflow-hidden">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to select files</span></p>
                        <p className="text-xs text-muted-foreground/70 mt-1 px-4 text-center">Images will be automatically resized (1600px max) and converted to WebP.</p>
                      </div>
                      <input type="file" className="hidden" accept=".jpeg,.jpg,.png,.webp,.heic,.heif,.mp4,.mov,.qt" multiple onChange={handleFileChange} />
                    </label>
                  </div>

                  {/* Selected Files List with Custom Naming */}
                  {uploadFiles.length > 0 && (
                    <div className="space-y-3 pt-4">
                      <h4 className="text-xs uppercase tracking-widest text-primary font-medium">Selected Files (Review Names)</h4>
                      {uploadFiles.map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center bg-black/40 p-3 rounded-lg border border-border/20">
                          <span className="text-xs text-muted-foreground truncate w-full sm:w-1/3" title={item.file.name}>{item.file.name}</span>
                          <input 
                            type="text" 
                            value={item.customName} 
                            onChange={(e) => handleUpdateCustomName(idx, e.target.value)}
                            placeholder="Custom name"
                            className="flex-1 h-9 bg-black/50 border border-border/30 rounded px-3 text-xs focus:border-primary/50 outline-none w-full"
                          />
                          <button type="button" onClick={() => handleRemoveUploadFile(idx)} className="text-red-400 hover:text-red-300 p-2 ml-1" title="Remove file">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status & Submit */}
                  {message && (
                    <div className={`p-3.5 rounded-lg text-sm border flex items-start gap-3 transition-all ${
                      status === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-200' :
                      status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                      'bg-primary/10 border-primary/30 text-primary'
                    }`}>
                      {status === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />}
                      {status === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />}
                      {status === 'uploading' && <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary animate-spin" />}
                      <span className="leading-relaxed">{message}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={status === 'uploading' || uploadFiles.length === 0 || isTokenValid !== true} className="w-full h-12 text-sm font-semibold tracking-wide flex items-center justify-center gap-2">
                    {status === 'uploading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing & Uploading...</> : <><UploadCloud className="w-4 h-4" /> Upload Files to GitHub</>}
                  </Button>
                </form>
              )}

              {/* Asset Manager: Manage View */}
              {assetView === 'manage' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAssetView('menu')} className="text-muted-foreground hover:bg-transparent pl-0">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <h2 className="text-lg font-display text-foreground">Manage Existing Assets</h2>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button type="button" variant="outline" size="sm" onClick={fetchAssets} className="h-10 border-border/50 text-muted-foreground hover:text-foreground flex-shrink-0">
                        <RefreshCw className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Refresh</span>
                      </Button>
                      <select value={manageFolder} onChange={(e) => setManageFolder(e.target.value)} className="w-full sm:w-auto h-10 bg-black/40 border border-border/50 rounded-lg px-4 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-all appearance-none cursor-pointer">
                        {TARGET_FOLDERS.map((f) => <option key={f} value={f} className="bg-[#120F0D]">{f}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {message && (
                    <div className={`p-3.5 rounded-lg text-sm border flex items-start gap-3 transition-all ${
                      status === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-200' :
                      status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                      'bg-primary/10 border-primary/30 text-primary'
                    }`}>
                      {status === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />}
                      {status === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />}
                      {status === 'uploading' && <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary animate-spin" />}
                      <span className="leading-relaxed">{message}</span>
                    </div>
                  )}

                  {isLoadingAssets ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                      <p>Fetching files from GitHub...</p>
                    </div>
                  ) : existingAssets.length === 0 ? (
                    <div className="text-center py-20 bg-black/20 border border-border/20 rounded-xl">
                      <p className="text-muted-foreground">No files found in this folder.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {existingAssets.map((asset) => (
                        <div key={asset.sha} className="bg-black/40 border border-border/30 rounded-xl p-4 flex gap-4 items-center">
                          {/* Preview Thumbnail */}
                          <div className="w-16 h-16 rounded-md bg-black/50 border border-border/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {asset.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                              <img src={asset.download_url} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <span className="text-[10px] text-muted-foreground uppercase">{asset.name.split('.').pop()}</span>
                            )}
                          </div>
                          
                          {/* Asset Info & Controls */}
                          <div className="flex-1 min-w-0">
                            {editingAssetSha === asset.sha ? (
                              <div className="space-y-2">
                                <input 
                                  type="text" 
                                  value={editAssetName}
                                  onChange={(e) => setEditAssetName(e.target.value)}
                                  className="w-full h-8 bg-black/60 border border-primary/50 rounded px-2 text-xs focus:outline-none"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-7 text-[10px] px-2" onClick={() => handleRenameAsset(asset)}>Save Name</Button>
                                  <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => setEditingAssetSha(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
                                <div className="flex flex-wrap items-center gap-x-3 mt-2">
                                  <button onClick={() => { setEditingAssetSha(asset.sha); setEditAssetName(asset.name); }} className="text-xs text-primary hover:underline flex items-center gap-1">
                                    <FileEdit className="w-3 h-3" /> Rename
                                  </button>
                                  
                                  <button onClick={() => handleDeleteAsset(asset)} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- TAB: EDIT PACKAGES --- */}
          {currentView === 'packages' && (
            <form onSubmit={handleSavePackages} className="relative z-10 max-w-2xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-display text-foreground">Package Manager</h2>
                  <p className="text-sm text-muted-foreground mt-1">Select a package to edit its details and features.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={fetchPackagesData} className="h-10 border-border/50 text-muted-foreground hover:text-foreground flex-shrink-0 w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
                </Button>
              </div>

              <div className="space-y-3">
                {packages.map((pkg, pIdx) => (
                  <div key={pIdx} className={`bg-black/30 border rounded-xl overflow-hidden transition-all duration-300 ${expandedPackageIndex === pIdx ? 'border-primary/50 shadow-[0_0_20px_hsl(28_55%_58%/0.15)]' : 'border-border/40 hover:border-primary/30'}`}>
                    {/* Accordion Header */}
                    <button 
                      type="button" 
                      onClick={() => setExpandedPackageIndex(expandedPackageIndex === pIdx ? null : pIdx)}
                      className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-black/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-primary/70 font-mono text-sm">{String(pIdx + 1).padStart(2, '0')}.</span>
                        <span className="font-medium text-foreground">{pkg.name}</span>
                        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border/30 bg-black/40 hidden sm:inline-block uppercase tracking-wider">{pkg.tier}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {expandedPackageIndex === pIdx ? (
                           <span className="text-xs uppercase tracking-widest text-primary">Close ✕</span>
                        ) : (
                           <span className="text-xs uppercase tracking-widest">Edit</span>
                        )}
                      </div>
                    </button>

                    {/* Accordion Body (Form) */}
                    {expandedPackageIndex === pIdx && (
                      <div className="p-5 border-t border-border/20 bg-black/20 space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-primary">Package Details</h4>
                          <button type="button" onClick={() => removePackage(pIdx)} className="text-xs text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Delete Package
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Name</label>
                            <input type="text" value={pkg.name} onChange={(e) => updatePackage(pIdx, 'name', e.target.value)} className="w-full h-9 bg-black/50 border border-border/30 rounded px-3 text-sm focus:border-primary/50 outline-none" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">ID (URL slug)</label>
                            <input type="text" value={pkg.id} onChange={(e) => updatePackage(pIdx, 'id', e.target.value)} className="w-full h-9 bg-black/50 border border-border/30 rounded px-3 text-sm focus:border-primary/50 outline-none" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Tier</label>
                            <input type="text" value={pkg.tier} onChange={(e) => updatePackage(pIdx, 'tier', e.target.value)} className="w-full h-9 bg-black/50 border border-border/30 rounded px-3 text-sm focus:border-primary/50 outline-none" required />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Price</label>
                            <input type="text" value={pkg.price} onChange={(e) => updatePackage(pIdx, 'price', e.target.value)} className="w-full h-9 bg-black/50 border border-border/30 rounded px-3 text-sm focus:border-primary/50 outline-none" required />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Note</label>
                            <input type="text" value={pkg.note} onChange={(e) => updatePackage(pIdx, 'note', e.target.value)} className="w-full h-9 bg-black/50 border border-border/30 rounded px-3 text-sm focus:border-primary/50 outline-none" required />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">WhatsApp Msg</label>
                            <input type="text" value={pkg.whatsapp} onChange={(e) => updatePackage(pIdx, 'whatsapp', e.target.value)} className="w-full h-9 bg-black/50 border border-border/30 rounded px-3 text-sm focus:border-primary/50 outline-none" required />
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border/20">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Features Included</label>
                          <div className="space-y-2">
                            {pkg.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2">
                                <span className="text-primary/50">•</span>
                                <input type="text" value={feat} onChange={(e) => updateFeature(pIdx, fIdx, e.target.value)} className="flex-1 h-8 bg-black/40 border border-border/20 rounded px-3 text-xs focus:border-primary/40 outline-none" required />
                                <button type="button" onClick={() => removeFeature(pIdx, fIdx)} className="text-muted-foreground hover:text-red-400 p-1">
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => addFeature(pIdx)} className="text-xs h-7 mt-2 text-primary hover:text-primary-foreground hover:bg-primary/20">
                            <Plus className="w-3 h-3 mr-1" /> Add Feature
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input type="checkbox" id={`feat-${pIdx}`} checked={pkg.featured} onChange={(e) => updatePackage(pIdx, 'featured', e.target.checked)} className="accent-primary" />
                          <label htmlFor={`feat-${pIdx}`} className="text-xs text-muted-foreground cursor-pointer">Mark as Featured Package (Highlights it in UI)</label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-6 mt-8">
                <Button type="button" variant="outline" onClick={addPackage} className="border-dashed border-border/50 text-muted-foreground hover:text-foreground">
                  <Plus className="w-4 h-4 mr-2" /> Add New Package
                </Button>

                <div className="w-full space-y-4 pt-6 border-t border-border/20">
                  {pkgMessage && (
                    <div className={`p-3.5 rounded-lg text-sm border flex items-start gap-3 transition-all ${
                      pkgStatus === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-200' :
                      pkgStatus === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                      'bg-primary/10 border-primary/30 text-primary'
                    }`}>
                      {pkgStatus === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-400" />}
                      {pkgStatus === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />}
                      {pkgStatus === 'saving' && <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary animate-spin" />}
                      <span className="leading-relaxed">{pkgMessage}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={pkgStatus === 'saving' || isTokenValid !== true} className="w-full h-12 text-sm font-semibold tracking-wide">
                    {pkgStatus === 'saving' ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving changes...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save All Changes to GitHub</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
}
