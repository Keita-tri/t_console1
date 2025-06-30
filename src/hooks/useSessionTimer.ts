import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useSessionTimer() {
  const { session, actions } = useAppStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    if (session.status === 'running') {
      // セッション開始
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const deltaTime = now - lastUpdateRef.current;
        lastUpdateRef.current = now;
        
        // セッション時間を更新（ストア内で処理）
        actions.updateElapsedTime?.(deltaTime);
      }, 100); // 100ms間隔で更新
    } else {
      // セッション停止・一時停止
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session.status, actions]);

  // セッション状態が変更された際の時刻更新
  useEffect(() => {
    lastUpdateRef.current = Date.now();
  }, [session.status]);

  return {
    elapsedTime: session.elapsedTime,
    status: session.status,
    startSession: actions.startSession,
    stopSession: actions.stopSession,
    pauseSession: actions.pauseSession,
    addLap: actions.addLap
  };
}