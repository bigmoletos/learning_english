/**
 * Test de vérification Firebase et Capacitor
 * Ce fichier peut être importé dans App.tsx pour vérifier l'initialisation
 */

import { db, app } from "../services/firebase/config";
import { Capacitor } from "@capacitor/core";

export const checkFirebaseInitialization = () => {
  console.log("🔍 Vérification de l'initialisation Firebase...");

  if (app) {
    console.log("✅ Firebase App initialisé");
  } else {
    console.warn("⚠️ Firebase App non initialisé (variables d'environnement manquantes)");
  }

  if (db) {
    console.log("✅ Firestore initialisé");
  } else {
    console.warn("⚠️ Firestore non initialisé");
  }

  return { app: !!app, db: !!db };
};

export const checkCapacitorPlatform = () => {
  console.log("🔍 Vérification de la plateforme Capacitor...");

  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  console.log(`📱 Plateforme: ${platform}`);
  console.log(`📱 Native: ${isNative ? "Oui" : "Non"}`);

  return { platform, isNative };
};

export const runInitializationChecks = () => {
  console.log("=".repeat(50));
  console.log("🚀 Vérification de l'initialisation");
  console.log("=".repeat(50));

  const fbStatus = checkFirebaseInitialization();
  const capStatus = checkCapacitorPlatform();

  console.log("=".repeat(50));

  return {
    firebase: fbStatus,
    capacitor: capStatus
  };
};

