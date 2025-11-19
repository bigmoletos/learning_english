/**
 * Service de gestion sécurisée des tokens Firebase
 * Gère le rafraîchissement automatique et la sécurité
 * @version 1.0.0
 * @date 2025-11-19
 */

import { User } from 'firebase/auth';
import { logger } from './logger';

interface TokenData {
  token: string;
  expiresAt: number;
  userId: string;
}

class TokenManager {
  private static readonly TOKEN_STORAGE_KEY = 'firebase_token_data';
  private static readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes
  private static readonly TOKEN_VALIDITY_DURATION = 60 * 60 * 1000; // 1 hour

  private refreshInterval: NodeJS.Timeout | null = null;
  private currentUser: User | null = null;

  /**
   * Initialize token manager with Firebase user
   */
  initialize(user: User): void {
    this.currentUser = user;
    this.startAutoRefresh();
    logger.info('[TokenManager] Initialized', { userId: user.uid });
  }

  /**
   * Store token securely with expiration metadata
   */
  async setToken(user: User): Promise<void> {
    try {
      const token = await user.getIdToken();
      const expiresAt = Date.now() + TokenManager.TOKEN_VALIDITY_DURATION;

      const tokenData: TokenData = {
        token,
        expiresAt,
        userId: user.uid,
      };

      // Store encrypted data (in a real app, consider using Web Crypto API)
      sessionStorage.setItem(
        TokenManager.TOKEN_STORAGE_KEY,
        JSON.stringify(tokenData)
      );

      logger.debug('[TokenManager] Token stored', {
        userId: user.uid,
        expiresAt: new Date(expiresAt).toISOString()
      });
    } catch (error) {
      logger.error('[TokenManager] Failed to store token', error, { userId: user.uid });
      throw error;
    }
  }

  /**
   * Get current valid token, refresh if expired
   */
  async getToken(): Promise<string | null> {
    try {
      const storedData = sessionStorage.getItem(TokenManager.TOKEN_STORAGE_KEY);

      if (!storedData) {
        logger.warn('[TokenManager] No token found in storage');
        return null;
      }

      const tokenData: TokenData = JSON.parse(storedData);

      // Check if token is expired or about to expire (within 5 minutes)
      const isExpired = tokenData.expiresAt - Date.now() < 5 * 60 * 1000;

      if (isExpired && this.currentUser) {
        logger.info('[TokenManager] Token expired, refreshing...', {
          userId: tokenData.userId
        });
        await this.refreshToken();
        return this.getToken(); // Recursive call to get new token
      }

      return tokenData.token;
    } catch (error) {
      logger.error('[TokenManager] Failed to get token', error);
      return null;
    }
  }

  /**
   * Refresh the current token
   */
  async refreshToken(): Promise<void> {
    if (!this.currentUser) {
      logger.warn('[TokenManager] Cannot refresh token: no user');
      return;
    }

    try {
      logger.debug('[TokenManager] Refreshing token...', {
        userId: this.currentUser.uid
      });

      const newToken = await this.currentUser.getIdToken(true); // Force refresh
      const expiresAt = Date.now() + TokenManager.TOKEN_VALIDITY_DURATION;

      const tokenData: TokenData = {
        token: newToken,
        expiresAt,
        userId: this.currentUser.uid,
      };

      sessionStorage.setItem(
        TokenManager.TOKEN_STORAGE_KEY,
        JSON.stringify(tokenData)
      );

      logger.info('[TokenManager] Token refreshed successfully', {
        userId: this.currentUser.uid,
        expiresAt: new Date(expiresAt).toISOString()
      });
    } catch (error) {
      logger.error('[TokenManager] Failed to refresh token', error, {
        userId: this.currentUser?.uid
      });
      throw error;
    }
  }

  /**
   * Start automatic token refresh
   */
  private startAutoRefresh(): void {
    // Clear existing interval
    this.stopAutoRefresh();

    // Set up new interval
    this.refreshInterval = setInterval(() => {
      if (this.currentUser) {
        this.refreshToken().catch(error => {
          logger.error('[TokenManager] Auto-refresh failed', error);
        });
      }
    }, TokenManager.TOKEN_REFRESH_INTERVAL);

    logger.debug('[TokenManager] Auto-refresh started', {
      intervalMs: TokenManager.TOKEN_REFRESH_INTERVAL
    });
  }

  /**
   * Stop automatic token refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      logger.debug('[TokenManager] Auto-refresh stopped');
    }
  }

  /**
   * Clear all stored tokens
   */
  clearToken(): void {
    sessionStorage.removeItem(TokenManager.TOKEN_STORAGE_KEY);
    this.stopAutoRefresh();
    this.currentUser = null;
    logger.info('[TokenManager] Token cleared');
  }

  /**
   * Check if user has a valid token
   */
  hasValidToken(): boolean {
    try {
      const storedData = sessionStorage.getItem(TokenManager.TOKEN_STORAGE_KEY);
      if (!storedData) return false;

      const tokenData: TokenData = JSON.parse(storedData);
      return tokenData.expiresAt > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Cleanup on logout or app close
   */
  destroy(): void {
    this.stopAutoRefresh();
    this.clearToken();
    logger.info('[TokenManager] Destroyed');
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
