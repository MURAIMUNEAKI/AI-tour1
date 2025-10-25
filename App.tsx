
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchDestinationInfo } from './services/geminiService';
import type { GroundingChunk, UserLocation } from './types';
import { GlobeAltIcon } from './components/Icons';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (geoError) => {
        console.warn("Geolocation permission denied or unavailable.", geoError.message);
        // Silently fail, the app can still work without location.
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setResultText(null);
    setGroundingSources([]);
    setQuery(searchQuery);

    try {
      const response = await fetchDestinationInfo(searchQuery, userLocation);
      if (response) {
        setResultText(response.text);
        setGroundingSources(response.groundingChunks || []);
      } else {
        setError('No response from the service. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching data. Please check your connection or API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <p className="text-center text-slate-600 mb-6">
            行きたい観光地の名前を入力してください。AIが地図情報と合わせて案内します。
          </p>
          <SearchBar onSearch={handleSearch} loading={isLoading} />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center p-6 bg-red-100 text-red-700 rounded-xl">
              <h3 className="font-bold text-lg mb-2">Error</h3>
              <p>{error}</p>
            </div>
          ) : resultText ? (
            <ResultDisplay 
              query={query} 
              text={resultText} 
              sources={groundingSources} 
            />
          ) : (
            <div className="text-center text-slate-500 pt-10">
              <GlobeAltIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className="text-lg">AI Tourist Guide</p>
              <p>あなたの旅の計画をお手伝いします。</p>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-400">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
