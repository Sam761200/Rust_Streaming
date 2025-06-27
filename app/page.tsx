'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { API_CONFIG } from './config';

interface Video {
  name: string;
  size_mb: number;
  episode?: string;
}

interface Season {
  season_number: string;
  episodes: Video[];
}

interface Series {
  name: string;
  seasons: Season[];
  type: 'series';
}

interface Movie {
  name: string;
  size_mb: number;
  type: 'movie';
}

interface LibraryResponse {
  series: Series[];
  movies: Movie[];
}

type ContentType = 'all' | 'movies' | 'series';
type SortBy = 'name' | 'size' | 'episodes';

export default function Home() {
  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  
  // Nouveaux états pour les filtres et la pagination
  const [contentFilter, setContentFilter] = useState<ContentType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [contentFilter, searchTerm]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/videos?token=${API_CONFIG.API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      const adaptedData: LibraryResponse = {
        series: data.series || [],
        movies: data.movies || []
      };
      
      setLibrary(adaptedData);
      
      if (adaptedData.series && adaptedData.series.length > 0) {
        setSelectedSeries(adaptedData.series[0].name);
        if (adaptedData.series[0].seasons.length > 0) {
          setSelectedSeason(adaptedData.series[0].seasons[0].season_number);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement des vidéos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContent = () => {
    if (!library) return [];
    
    let content: (Series | Movie)[] = [];
    
    if (contentFilter === 'all' || contentFilter === 'series') {
      content = [...content, ...library.series];
    }
    
    if (contentFilter === 'all' || contentFilter === 'movies') {
      content = [...content, ...library.movies];
    }
    
    if (searchTerm) {
      content = content.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    content.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          if (a.type === 'movie' && b.type === 'movie') {
            return b.size_mb - a.size_mb;
          }
          if (a.type === 'series' && b.type === 'series') {
            const aSize = a.seasons.reduce((acc, season) => 
              acc + season.episodes.reduce((sum, ep) => sum + ep.size_mb, 0), 0);
            const bSize = b.seasons.reduce((acc, season) => 
              acc + season.episodes.reduce((sum, ep) => sum + ep.size_mb, 0), 0);
            return bSize - aSize;
          }
          return a.type === 'movie' ? -1 : 1;
        case 'episodes':
          if (a.type === 'series' && b.type === 'series') {
            const aEpisodes = a.seasons.reduce((acc, season) => acc + season.episodes.length, 0);
            const bEpisodes = b.seasons.reduce((acc, season) => acc + season.episodes.length, 0);
            return bEpisodes - aEpisodes;
          }
          return a.type === 'series' ? -1 : 1;
        default:
          return 0;
      }
    });
    
    return content;
  };

  const filteredContent = getFilteredContent();
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContent = filteredContent.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">📼 PapyStreaming</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-xl text-gray-600 dark:text-gray-400">Chargement de la bibliothèque...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">📼 PapyStreaming</h1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erreur:</strong> {error}
          </div>
          <button 
            onClick={fetchVideos}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!library || (library.series.length === 0 && library.movies.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">📼 PapyStreaming</h1>
        <div className="text-center p-8">
          <p className="text-xl text-gray-600 dark:text-gray-400">Aucun contenu disponible</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Vérifiez que le dossier videos contient des films et des séries
          </p>
        </div>
      </div>
    );
  }

  const currentSeries = library.series.find(s => s.name === selectedSeries);
  const currentSeason = currentSeries?.seasons.find(s => s.season_number === selectedSeason);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">📼 PapyStreaming</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un film ou une série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setContentFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  contentFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Tout ({library.series.length + library.movies.length})
              </button>
              <button
                onClick={() => setContentFilter('movies')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  contentFilter === 'movies'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🎬 Films ({library.movies.length})
              </button>
              <button
                onClick={() => setContentFilter('series')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  contentFilter === 'series'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📺 Séries ({library.series.length})
              </button>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Trier par nom</option>
              <option value="size">Trier par taille</option>
              <option value="episodes">Trier par nb d'épisodes</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredContent.length} résultat{filteredContent.length > 1 ? 's' : ''} trouvé{filteredContent.length > 1 ? 's' : ''}
            {totalPages > 1 && ` - Page ${currentPage} sur ${totalPages}`}
          </p>
        </div>

        {selectedSeries && currentSeries && currentSeason && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  📺 {currentSeries.name}
                </h3>
                <button
                  onClick={() => {
                    setSelectedSeries(null);
                    setSelectedSeason(null);
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  ← Retour
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Saisons</h4>
                <div className="flex flex-wrap gap-2">
                  {currentSeries.seasons.map((season) => (
                    <button
                      key={season.season_number}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`px-3 py-1 rounded font-medium transition-colors ${
                        selectedSeason === season.season_number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {season.season_number} ({season.episodes.length} épisodes)
                    </button>
                  ))}
                </div>
              </div>

              <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Épisodes - {currentSeason.season_number}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentSeason.episodes.map((video, index) => (
                  <VideoCard 
                    key={video.name} 
                    video={video} 
                    series={currentSeries.name}
                    season={currentSeason.season_number}
                    episodeNumber={index + 1}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedSeries && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedContent.map((item) => (
                item.type === 'series' ? (
                  <SeriesCard 
                    key={item.name} 
                    series={item} 
                    onSelect={() => {
                      setSelectedSeries(item.name);
                      setSelectedSeason(item.seasons[0]?.season_number || null);
                    }}
                  />
                ) : (
                  <MovieCard key={item.name} movie={item} />
                )
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  ← Précédent
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SeriesCard({ 
  series, 
  onSelect 
}: { 
  series: Series; 
  onSelect: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  
  const totalEpisodes = series.seasons.reduce((acc, season) => acc + season.episodes.length, 0);
  const totalSize = series.seasons.reduce((acc, season) => 
    acc + season.episodes.reduce((sum, ep) => sum + ep.size_mb, 0), 0);
  
  const firstEpisode = series.seasons[0]?.episodes[0];
  const thumbnailUrl = firstEpisode 
    ? `${API_CONFIG.BASE_URL}/thumbs/${series.name}/${series.seasons[0].season_number}/${firstEpisode.name.replace('.mp4', '.jpg')}?token=${API_CONFIG.API_KEY}`
    : '';
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700">
        {!imageError && thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Affiche de ${series.name}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">📺</span>
              <p className="text-sm text-gray-500 mt-2">Série</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
          📺 Série
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate" title={series.name}>
          {series.name}
        </h3>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>{series.seasons.length} saison{series.seasons.length > 1 ? 's' : ''}</p>
          <p>{totalEpisodes} épisode{totalEpisodes > 1 ? 's' : ''}</p>
          <p>Taille: {(totalSize / 1024).toFixed(1)} GB</p>
        </div>
        
        <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors text-sm">
          📺 Voir les épisodes
        </button>
      </div>
    </div>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const [imageError, setImageError] = useState(false);
  
  const thumbnailUrl = `${API_CONFIG.BASE_URL}/thumbs/${movie.name.replace('.mp4', '.jpg')}?token=${API_CONFIG.API_KEY}`;
  const streamUrl = `${API_CONFIG.BASE_URL}/stream/${movie.name}?token=${API_CONFIG.API_KEY}`;
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700">
        {!imageError ? (
          <Image
            src={thumbnailUrl}
            alt={`Affiche de ${movie.name}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">🎬</span>
              <p className="text-sm text-gray-500 mt-2">Film</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
          🎬 Film
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate" title={movie.name}>
          {movie.name.replace('.mp4', '')}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Taille: {(movie.size_mb / 1024).toFixed(1)} GB
        </p>
        
        <div className="flex flex-col gap-2">
          <a
            href={streamUrl}
            className="bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded transition-colors text-sm"
            target="_blank"
            rel="noreferrer"
          >
            ▶️ Regarder
          </a>
          
          <a
            href={streamUrl}
            download={movie.name}
            className="bg-gray-500 hover:bg-gray-600 text-white text-center py-2 px-4 rounded transition-colors text-sm"
          >
            📥 Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ 
  video, 
  series, 
  season, 
  episodeNumber 
}: { 
  video: Video; 
  series: string; 
  season: string; 
  episodeNumber: number;
}) {
  const [imageError, setImageError] = useState(false);
  
  const videoPath = `${series}/${season}/${video.name}`;
  const thumbnailUrl = `${API_CONFIG.BASE_URL}/thumbs/${videoPath.replace('.mp4', '.jpg')}?token=${API_CONFIG.API_KEY}`;
  const streamUrl = `${API_CONFIG.BASE_URL}/stream/${videoPath}?token=${API_CONFIG.API_KEY}`;
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
        {!imageError ? (
          <Image
            src={thumbnailUrl}
            alt={`Miniature de ${video.name}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl">🎬</span>
              <p className="text-xs text-gray-500 mt-1">Épisode {episodeNumber}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate" title={video.name}>
          Épisode {episodeNumber}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
          {video.name}
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
          Taille: {video.size_mb.toFixed(1)} MB
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={streamUrl}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded transition-colors text-sm"
            target="_blank"
            rel="noreferrer"
          >
            ▶️ Regarder
          </a>
          
          <a
            href={streamUrl}
            download={video.name}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-center py-2 px-4 rounded transition-colors text-sm"
          >
            📥 Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}