'use client';

import React, { useState, useEffect } from 'react';
import { Star, Clock, CheckCircle, AlertCircle, TrendingUp, Award, Target } from 'lucide-react';
import { AppTrackingManager, AppUsage, AppPerformance } from '../lib/appTracking';

interface ValutazioneProgettoProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  appName: string;
  taskType: string;
  usageId?: string;
}

export default function ValutazioneProgetto({ 
  isOpen, 
  onClose, 
  projectId, 
  appName, 
  taskType, 
  usageId 
}: ValutazioneProgettoProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(true);
  const [difficulty, setDifficulty] = useState<'facile' | 'medio' | 'difficile'>('medio');
  const [satisfaction, setSatisfaction] = useState(3);
  const [wouldUseAgain, setWouldUseAgain] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [appPerformance, setAppPerformance] = useState<AppPerformance | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Carica suggerimenti intelligenti
      const intelligentSuggestions = AppTrackingManager.getIntelligentSuggestions(taskType);
      setSuggestions(intelligentSuggestions);
      
      // Carica performance dell'app
      const performance = AppTrackingManager.getAppPerformance(appName, taskType);
      setAppPerformance(performance);
    }
  }, [isOpen, appName, taskType]);

  const handleSubmit = () => {
    if (usageId) {
      // Completa tracking esistente
      AppTrackingManager.endTracking(
        usageId,
        rating,
        notes,
        success,
        difficulty,
        satisfaction,
        wouldUseAgain
      );
    } else {
      // Crea nuovo tracking
      const newUsageId = AppTrackingManager.startTracking(appName, taskType, projectId);
      AppTrackingManager.endTracking(
        newUsageId,
        rating,
        notes,
        success,
        difficulty,
        satisfaction,
        wouldUseAgain
      );
    }
    
    setShowSuggestions(true);
    setTimeout(() => {
      onClose();
      setShowSuggestions(false);
    }, 3000);
  };

  const renderStars = (currentRating: number, onRate: (rating: number) => void, onHover?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-8 h-8 cursor-pointer transition-colors ${
              star <= (onHover ? hoverRating : currentRating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onHover && onHover(0)}
          />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!showSuggestions ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Award className="w-6 h-6 mr-2 text-blue-600" />
                Valuta il Progetto
              </h2>
              <p className="text-gray-600 mt-1">
                Come è andato usando <span className="font-semibold text-blue-600">{appName}</span> per {taskType}?
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Performance attuale dell'app */}
              {appPerformance && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Performance Attuale di {appName}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Rating medio:</span>
                      <span className="ml-2 font-semibold">{appPerformance.averageRating.toFixed(1)}/5 ⭐</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Tasso successo:</span>
                      <span className="ml-2 font-semibold">{appPerformance.successRate.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Tempo medio:</span>
                      <span className="ml-2 font-semibold">{appPerformance.averageDuration.toFixed(0)} min</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Utilizzi totali:</span>
                      <span className="ml-2 font-semibold">{appPerformance.totalUsages}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating generale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating Generale (1-5 stelle)
                </label>
                {renderStars(rating, setRating, setHoverRating)}
                <p className="text-sm text-gray-500 mt-1">
                  {rating === 0 && "Seleziona un rating"}
                  {rating === 1 && "Molto insoddisfacente"}
                  {rating === 2 && "Insoddisfacente"}
                  {rating === 3 && "Nella media"}
                  {rating === 4 && "Buono"}
                  {rating === 5 && "Eccellente"}
                </p>
              </div>

              {/* Successo del progetto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Il progetto è stato completato con successo?
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSuccess(true)}
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                      success
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sì, completato
                  </button>
                  <button
                    onClick={() => setSuccess(false)}
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                      !success
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    No, non completato
                  </button>
                </div>
              </div>

              {/* Difficoltà */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Livello di difficoltà percepito
                </label>
                <div className="flex space-x-2">
                  {(['facile', 'medio', 'difficile'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-4 py-2 rounded-lg border capitalize ${
                        difficulty === level
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soddisfazione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soddisfazione complessiva (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSatisfaction(level)}
                      className={`w-10 h-10 rounded-full border ${
                        satisfaction === level
                          ? 'bg-purple-100 border-purple-300 text-purple-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Riutilizzo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Useresti di nuovo {appName} per questo tipo di task?
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setWouldUseAgain(true)}
                    className={`px-4 py-2 rounded-lg border ${
                      wouldUseAgain
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  >
                    Sì, lo riuserei
                  </button>
                  <button
                    onClick={() => setWouldUseAgain(false)}
                    className={`px-4 py-2 rounded-lg border ${
                      !wouldUseAgain
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  >
                    No, cercherei alternative
                  </button>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note aggiuntive (opzionale)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Cosa è andato bene? Cosa potresti migliorare la prossima volta?"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Target className="w-4 h-4 mr-2" />
                Salva Valutazione
              </button>
            </div>
          </>
        ) : (
          /* Suggerimenti post-valutazione */
          <div className="p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Valutazione Salvata!</h2>
              <p className="text-gray-600">Ecco alcuni suggerimenti basati sui tuoi dati:</p>
            </div>

            {suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Suggerimenti Intelligenti
                </h3>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-blue-800 text-sm flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500">Questa finestra si chiuderà automaticamente...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
