import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import { TrackData } from "../types";
import { getDownloadURL, ref } from "firebase/storage";

const useTrackData = (trackId: string): [TrackData | null, boolean] => {
    const [trackData, setTrackData] = useState<TrackData | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function fetchTrackData() {
            const snapshot = await getDoc(doc(db, "tracks", trackId));
            if (!cancelled) {
                if (snapshot.exists()) {
                    const trackData = snapshot.data() as TrackData;
                    if ("url" in trackData) {
                        const imageRef = ref(storage, trackData.url);
                        const downloadUrl = await getDownloadURL(imageRef);
                        trackData.url = downloadUrl;
                    }
                    setLoading(false);
                    setTrackData(trackData);
                } else {
                    setLoading(false);
                    setTrackData(undefined);
                }
            }
        }

        fetchTrackData();

        return () => {
            cancelled = true;
        };
    }, [trackId]);

    return [trackData, loading] as const;
};

export { useTrackData };
