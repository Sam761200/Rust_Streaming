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
}

interface LibraryResponse {
  series: Series[];
}

export default function Home() {
  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/videos?token=${API_CONFIG.API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setLibrary(data);
      
      // Auto-sélectionner la première série et saison si disponibles
      if (data.series && data.series.length > 0) {
        setSelectedSeries(data.series[0].name);
        if (data.series[0].seasons.length > 0) {
          setSelectedSeason(data.series[0].seasons[0].season_number);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement des vidéos:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (!library || library.series.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">📼 PapyStreaming</h1>
        <div className="text-center p-8">
          <p className="text-xl text-gray-600 dark:text-gray-400">Aucune série disponible</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Vérifiez que le dossier videos contient des séries organisées par saisons
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
        
        {/* Navigation des séries */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Séries</h2>
          <div className="flex flex-wrap gap-2">
            {library.series.map((series) => (
              <button
                key={series.name}
                onClick={() => {
                  setSelectedSeries(series.name);
                  setSelectedSeason(series.seasons[0]?.season_number || null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSeries === series.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {series.name} ({series.seasons.reduce((acc, season) => acc + season.episodes.length, 0)} épisodes)
              </button>
            ))}
          </div>
        </div>

        {/* Navigation des saisons */}
        {currentSeries && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Saisons - {currentSeries.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentSeries.seasons.map((season) => (
                <button
                  key={season.season_number}
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    selectedSeason === season.season_number
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {season.season_number} ({season.episodes.length} épisodes)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des épisodes */}
        {currentSeason && (
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">
              Épisodes - {currentSeries?.name} - {currentSeason.season_number}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentSeason.episodes.map((video, index) => (
                <VideoCard 
                  key={video.name} 
                  video={video} 
                  series={currentSeries!.name}
                  season={currentSeason.season_number}
                  episodeNumber={index + 1}
                />
              ))}
            </div>
          </div>
        )}
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
