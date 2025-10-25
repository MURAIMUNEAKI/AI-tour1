import React from 'react';
import type { GroundingChunk } from '../types';
import { LinkIcon, MapIcon } from './Icons';

interface ResultDisplayProps {
  query: string;
  text: string;
  sources: GroundingChunk[];
}

// Simple markdown-to-react converter for bold text
const formatText = (text: string) => {
  return text.split('\n').map((line, i) => {
    const parts = line.split('**');
    const styledLine = parts.map((part, index) => {
        return index % 2 !== 0 ? <strong key={index}>{part}</strong> : part;
    });
    return <p key={i} className="mb-4 last:mb-0">{styledLine}</p>;
  });
};

const getEmbedUrl = (uri: string, title: string): string | null => {
    try {
        const url = new URL(uri);
        // Gemini APIからのURIには、検索クエリが含まれていることが多い
        const query = url.searchParams.get('query');

        // 埋め込みに使う検索クエリを決定
        // 'query' パラメータがあればそれを使い、なければフォールバックとして情報のタイトルを使用
        const embedQuery = query || title;

        if (embedQuery) {
            // APIキー不要の汎用的なGoogle Maps埋め込みURLを生成
            return `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        }
        
        console.warn("Could not determine a query for map embedding from URI or title:", uri);
        return null;
    } catch (e) {
        console.error("Invalid map URI, cannot create embed URL", e);
        return null;
    }
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ query, text, sources }) => {
  const webSources = sources.filter(s => s.web);
  const mapSources = sources.filter(s => s.maps);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
      <div className="p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-6 text-slate-800 border-b-2 border-blue-500 pb-3">
          {query}
        </h2>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
          {formatText(text)}
        </div>
      </div>
      
      {(webSources.length > 0 || mapSources.length > 0) && (
        <div className="bg-slate-50 border-t border-slate-200 p-6 md:p-8">
          {webSources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center text-slate-700">
                <LinkIcon className="w-5 h-5 mr-2 text-slate-500" />
                関連情報 (Web)
              </h3>
              <ul className="list-none space-y-2">
                {webSources.map((source, index) => (
                  <li key={`web-${index}`} className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">&#8227;</span>
                    <a
                      href={source.web!.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                    >
                      {source.web!.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mapSources.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center text-slate-700">
                <MapIcon className="w-5 h-5 mr-2 text-slate-500" />
                地図・場所情報
              </h3>
              <ul className="list-none space-y-6">
                {mapSources.map((source, index) => {
                    const embedUrl = getEmbedUrl(source.maps!.uri, source.maps!.title);
                    return (
                      <li key={`map-${index}`}>
                        <a
                          href={source.maps!.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:underline hover:text-green-900 transition-colors font-semibold block mb-2"
                        >
                          {source.maps!.title}
                        </a>
                        {embedUrl ? (
                            <div className="w-full h-80">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={embedUrl}
                                    className="rounded-lg shadow-md"
                                >
                                </iframe>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">
                                地図プレビューは利用できません。
                                <a href={source.maps!.uri} target="_blank" rel="noopener noreferrer" className="underline ml-1">
                                    Googleマップで見る
                                </a>
                            </p>
                        )}
                      </li>
                    );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};