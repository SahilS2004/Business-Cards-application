import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Building2, Mail, Phone, Globe, MapPin, Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import { VisitingCard, ApiResponse } from './types';

function App() {
  const [cards, setCards] = useState<VisitingCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardsPerPage = 10;
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchAllCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://n8n-dev.subspace.money/webhook/visiting_card_get_all');
      if (!response.ok) throw new Error('Failed to fetch cards');
      const data: ApiResponse = await response.json();
      setCards(data.data.visiting_card);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchCards = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://n8n-dev.subspace.money/webhook/visiting_card_search?search=${query}`);
      if (!response.ok) throw new Error('Failed to search cards');
      const data: ApiResponse = await response.json();
      setCards(data.data.visiting_card);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCards();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      searchCards(searchQuery);
    }
  };

  const handleBack = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchAllCards();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const uploadImage = async () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const selectedFile = fileInput.files?.[0];

    if (!selectedFile) {
      alert('Please select a file!');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('filename', selectedFile.name);

    try {
      const response = await fetch('https://n8n-dev.subspace.money/webhook/visiting_card_manger', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload success:', result);
      alert('File uploaded successfully!');
      setIsModalOpen(false);
      setSelectedFileName('');
      fetchAllCards();
    } catch (error) {
      console.error('Upload error:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const paginatedCards = cards.slice((page - 1) * cardsPerPage, page * cardsPerPage);
  const totalPages = Math.ceil(cards.length / cardsPerPage);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-stone-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-stone-900 via-neutral-900 to-zinc-900 shadow-xl border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-amber-300" />
              <h1 className="text-2xl font-bold text-stone-100">Business Cards</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-amber-600/20 rounded-md shadow-sm text-sm font-medium text-amber-100 bg-amber-900/20 hover:bg-amber-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-amber-500 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Card
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          {isSearching && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-stone-700 rounded-md shadow-sm text-sm font-medium text-stone-300 bg-stone-800/50 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-amber-500 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
          )}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-stone-700 rounded-md leading-5 bg-stone-800/30 text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                placeholder="Search by name, company, or designation..."
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="inline-flex items-center px-4 py-2 border border-amber-600/20 rounded-md shadow-sm text-sm font-medium text-amber-100 bg-amber-900/20 hover:bg-amber-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {paginatedCards.map((card) => (
                <div key={card.id} className="bg-gradient-to-br from-stone-900/90 to-zinc-900/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-stone-800/50">
                  <div className="flex flex-col h-full">
                    {card.visiting_card_url && (
                      <div className="relative h-48">
                        <img
                          src={card.visiting_card_url}
                          alt={`${card.name}'s visiting card`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 to-transparent" />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-stone-100 mb-1">{card.name}</h3>
                      <p className="text-amber-400/90 font-medium">{card.designation}</p>
                      <p className="text-stone-400 mt-2">{card.company}</p>
                      
                      <div className="mt-4 space-y-3 flex-1">
                        {card.email && (
                          <div className="flex items-center text-stone-300 hover:text-amber-400 transition-colors duration-200">
                            <Mail className="h-4 w-4 mr-2" />
                            <a href={`mailto:${card.email}`}>{card.email}</a>
                          </div>
                        )}
                        {card.phone && (
                          <div className="flex items-center text-stone-300 hover:text-amber-400 transition-colors duration-200">
                            <Phone className="h-4 w-4 mr-2" />
                            <a href={`tel:${card.phone.split(',')[0]}`}>
                              {card.phone.split(',').join(' / ')}
                            </a>
                          </div>
                        )}
                        {card.website && (
                          <div className="flex items-center text-stone-300 hover:text-amber-400 transition-colors duration-200">
                            <Globe className="h-4 w-4 mr-2" />
                            <a href={card.website} target="_blank" rel="noopener noreferrer">
                              {card.website}
                            </a>
                          </div>
                        )}
                        {card.address && (
                          <div className="flex items-center text-stone-300">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{card.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-stone-700 bg-stone-800/50 text-sm font-medium text-stone-300 hover:bg-stone-800 disabled:opacity-50 transition-colors duration-200"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                        page === i + 1
                          ? 'z-10 bg-amber-900/40 border-amber-600/20 text-amber-100'
                          : 'border-stone-700 bg-stone-800/50 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-stone-700 bg-stone-800/50 text-sm font-medium text-stone-300 hover:bg-stone-800 disabled:opacity-50 transition-colors duration-200"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-stone-900 to-zinc-900 rounded-lg p-6 w-full max-w-md mx-4 relative border border-stone-800 shadow-xl">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedFileName('');
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-stone-100 mb-4">Upload Business Card</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-stone-700 rounded-lg p-6 text-center hover:border-amber-500/50 transition-colors">
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-stone-400" />
                  <span className="text-sm text-stone-300">
                    {selectedFileName || "Click to upload image"}
                  </span>
                </label>
              </div>

              <button
                onClick={uploadImage}
                disabled={!selectedFileName || isUploading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-amber-600/20 rounded-md shadow-sm text-sm font-medium text-amber-100 bg-amber-900/20 hover:bg-amber-900/40 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;