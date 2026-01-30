import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
            error: 'Database connection failed. Please try again later.',
        });
    }

    if (error.code === '23505') {
        return res.status(409).json({
            error: 'This action conflicts with existing data.',
        });
    }

    if (error.message) {
        return res.status(400).json({
            error: error.message,
        });
    }

    return res.status(500).json({
        error: 'An unexpected error occurred. Please try again.',
    });
}

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
