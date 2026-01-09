/**
 * Centralized logging utility
 * Supports different log levels for development and production
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Set log level based on environment
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    
    switch (envLevel) {
      case 'ERROR':
        this.level = LogLevel.ERROR;
        break;
      case 'WARN':
        this.level = LogLevel.WARN;
        break;
      case 'INFO':
        this.level = LogLevel.INFO;
        break;
      case 'DEBUG':
        this.level = LogLevel.DEBUG;
        break;
      default:
        // Default: INFO in production, DEBUG in development
        this.level = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
    }

    this.info(`Logger initialized - Level: ${LogLevel[this.level]}, Production: ${this.isProduction}`);
  }

  /**
   * Format log message with timestamp and level
   */
  private format(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitize(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization', 'cookie'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitize(sanitized[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: Error | any): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.format('ERROR', message));
      
      if (error) {
        if (error instanceof Error) {
          console.error('Stack:', error.stack);
        } else {
          console.error('Details:', this.sanitize(error));
        }
      }
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.format('WARN', message, this.sanitize(data)));
    }
  }

  /**
   * Log info messages
   */
  info(message: string, data?: any): void {
    if (this.level >= LogLevel.INFO) {
      console.log(this.format('INFO', message, this.sanitize(data)));
    }
  }

  /**
   * Log debug messages (only in development or when DEBUG level is set)
   */
  debug(message: string, data?: any): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(this.format('DEBUG', message, this.sanitize(data)));
    }
  }

  /**
   * Log HTTP requests (middleware helper)
   */
  request(method: string, url: string, statusCode?: number, duration?: number): void {
    if (this.level >= LogLevel.INFO) {
      const durationStr = duration ? ` (${duration}ms)` : '';
      const statusStr = statusCode ? ` ${statusCode}` : '';
      this.info(`${method} ${url}${statusStr}${durationStr}`);
    }
  }

  /**
   * Log authentication attempts
   */
  auth(action: string, userId?: number | string, success: boolean = true, details?: string): void {
    const level = success ? 'INFO' : 'WARN';
    const message = `Auth: ${action} - User: ${userId || 'unknown'} - Success: ${success}`;
    
    if (success) {
      this.info(message, details);
    } else {
      this.warn(message, details);
    }
  }

  /**
   * Log security events
   */
  security(event: string, details?: any): void {
    console.warn(this.format('SECURITY', event, this.sanitize(details)));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export request logging middleware
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req.method, req.originalUrl || req.url, res.statusCode, duration);
  });
  
  next();
}
