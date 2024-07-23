import React, { useState } from 'react';
import { CaptureError, CaptureVideoOptions, MediaCapture, MediaFile } from '@ionic-native/media-capture';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// Define a type for your video data
interface VideoData {
    url: string;
    file: string;
    name: string;
}

// Function to convert file to base64
const getBase64 = async (path: string): Promise<string> => {
    try {
        const result = await Filesystem.readFile({
            path,
            directory: Directory.Data,
            // encoding: 'base64'
        });
        return `data:video/mp4;base64,${result.data}`;
    } catch (error) {
        console.error('Error reading file:', error);
        return '';
    }
};

// Define the hook for video capture
const useCaptureVideo = () => {
    const [videos, setVideos] = useState<VideoData[]>([]);

    const takeVideo = () => {
        const options: CaptureVideoOptions = {
            limit: 1,
            duration: 30,
            quality: 0.5,
        };

        MediaCapture.captureVideo(options).then((result: MediaFile[] | CaptureError) => {
            if (Array.isArray(result)) {
                const capture = result;
                const fileName = `damaged-${new Date().getTime()}.mp4`;
                getBase64(capture[0].fullPath).then(base64Data => {
                    const newVideos: VideoData[] = [
                        ...videos,
                        {
                            url: Capacitor.convertFileSrc(capture[0].fullPath),
                            file: base64Data.replace(/^data:video\/(mp4);base64,/, ''),
                            name: fileName
                        }
                    ];
                    setVideos(newVideos);
                    console.log(`Captured video path: ${capture[0].fullPath}`);
                    console.log(`Video properties: ${JSON.stringify(capture[0])}`);
                    console.log('video is recorded with the given specs')
                }).catch(err => {
                    console.error('Error converting file to base64:', err);
                });
            } else {
                console.error('Error capturing video with given specs:', result);
            }
        }).catch((err: CaptureError) => {
            console.error('Error:', err);
        });
    };

    const removeVideo = (url: string) => {
        const newVideos = videos.filter((video) => video.url !== url);
        setVideos(newVideos);
    };

    return { videos, takeVideo, removeVideo };
};

// ExploreContainer component
const ExploreContainer: React.FC = () => {
    const { videos, takeVideo, removeVideo } = useCaptureVideo();

    return (
        <div>
            <h1>Explore Videos</h1>
            <button onClick={takeVideo}>Capture Video</button>
            <div>
                {videos.length > 0 ? (
                    <ul>
                        {videos.map((video) => (
                            <li key={video.name}>
                                <video
                                    src={video.url}
                                    controls
                                    width="300"
                                />
                                <button onClick={() => removeVideo(video.url)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No videos available</p>
                )}
            </div>
        </div>
    );
};

export default ExploreContainer;
