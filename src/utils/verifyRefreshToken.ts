import { AuthSessionsRepository } from './../repositories/auth-devises-sessions';
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { IRefreshTokenPayload } from "../services/jwt_service";
import { ClientsRepository } from '../repositories/clients-db-repository';
dotenv.config();

export const verifyRefreshToken = async (req: Request<{}, {}, { accessToken: string }>, res: Response, next: NextFunction) => {
	try {
		let refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			return res.sendStatus(401);
		};

		let decoded = <IRefreshTokenPayload>jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!);
		let { userId, deviceID } = decoded;

		let user = ClientsRepository.getUSerByID(userId);
		if (!user) {
			return res.sendStatus(401);
		}

		let authSessions = await AuthSessionsRepository.getSession(userId, deviceID);
		if (!authSessions) {
			return res.sendStatus(401);
		}

		req.authDeviceSession = authSessions;
		next();
	} catch (error) {
		console.log("Not valid refresh token");
		return res.sendStatus(401);
	}
}