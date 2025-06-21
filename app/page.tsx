'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { API_CONFIG } from './config';

interface Video {
  name: string;
  size_mb: number;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement des vidéos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📼 PapyStreaming</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Chargement des vidéos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📼 PapyStreaming</h1>
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
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📼 PapyStreaming</h1>
      
      {videos.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600">Aucune vidéo disponible</p>
          <p className="text-sm text-gray-500 mt-2">
            Vérifiez que le dossier &apos;videos&apos; contient des fichiers vidéo
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center">
            <span className="text-gray-600">{videos.length} vidéo(s) disponible(s)</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.name} video={video} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  const [imageError, setImageError] = useState(false);
  
  const thumbnailUrl = `${API_CONFIG.BASE_URL}/thumbs/${video.name.replace('.mp4', '.jpg')}?token=${API_CONFIG.API_KEY}`;
  const streamUrl = `${API_CONFIG.BASE_URL}/stream/${video.name}?token=${API_CONFIG.API_KEY}`;
  
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
            <span className="text-4xl">🎬</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate" title={video.name}>
          {video.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Taille: {video.size_mb.toFixed(1)} MB
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={streamUrl}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            ▶️ Regarder
          </a>
          
          <a
            href={streamUrl}
            download={video.name}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-center py-2 px-4 rounded transition-colors"
          >
            📥 Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}
