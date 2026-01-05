import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  getFirestore 
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import type { ROIRegion } from '@/types/roi';

// Initialize Firebase Client SDK (Singleton Pattern)
// Ensure you have these variables in your .env.local
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.PROJECT_ID, 
  // Add other config items if needed (apiKey, authDomain, etc.) 
  // For Firestore with public rules or specific auth, projectId is often sufficient for read-only if rules allow.
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export interface LiveRegion extends ROIRegion {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
}

export function useRealTimeCityData(cityId: string | undefined) {
  const [regions, setRegions] = useState<LiveRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityId) {
        setLoading(false);
        return;
    }

    setLoading(true);

    // Listen to the 'regions' subcollection: cities/{cityId}/regions
    // This matches the path the Python Agent writes to.
    const regionsRef = collection(db, 'cities', cityId, 'regions');
    const q = query(regionsRef);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const liveRegions: LiveRegion[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Map Firestore data to UI Types
          liveRegions.push({
            id: doc.id,
            name: data.name || doc.id,
            status: data.status || 'pending',
            error_message: data.error_message,
            
            // Coordinates & Geometry
            coordinates: data.coordinates 
                ? { lat: data.coordinates[1], lng: data.coordinates[0] } 
                : { lat: 0, lng: 0},
            polygonCoordinates: data.geometry?.coordinates?.[0]?.map((p: number[]) => ({ 
                lat: p[1], 
                lng: p[0] 
            })) || [],

            // Financials
            roiPercentage: data.roiPercentage || 0,
            projectedRevenue: data.projectedRevenue 
              ? `€${Number(data.projectedRevenue).toLocaleString()}` 
              : 'Calculating...',
            projectedCost: data.projectedCost || 0,
            netProfit: data.netProfit || 0,
            timeline: "24 Months",
            
            // Text Content
            executiveSummary: data.executive_summary || "",
            details: data.detailed_report || "Analysis pending...",
            
            // Placeholders for detailed fields
            marketSizeAndDensity: data.marketSizeAndDensity || "",
            demographicProfile: "", 
            projectedDemand: "", 
            deploymentComplexity: "", 
            laborAndResourceCosts: "", 
            incumbentAnalysis: "", 
            competitivePricing: "", 
            permittingAndRegulation: "", 
            esgImpactScore: "", 
            detailed_report: data.detailed_report || "",
            deepResearchReportUrl: "",
          });
        });

        // Sort: Completed items with High ROI first, then processing, then pending
        liveRegions.sort((a, b) => {
            // Priority: Completed > Processing > Pending
            const statusPriority = { completed: 3, processing: 2, pending: 1, failed: 0 };
            const statusDiff = statusPriority[b.status] - statusPriority[a.status];
            
            if (statusDiff !== 0) return statusDiff;
            
            // Secondary Sort: ROI (Highest first)
            return b.roiPercentage - a.roiPercentage;
        });

        setRegions(liveRegions);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Listener Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount or cityId change
    return () => unsubscribe();
  }, [cityId]);

  return { regions, loading, error };
}