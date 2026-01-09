import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import api from "../lib/api";

interface TwoFactorSetupProps {
  onClose?: () => void;
}

export default function TwoFactorSetup({ onClose }: TwoFactorSetupProps) {
  const [loading, setLoading] = useState(false);
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"status" | "setup" | "verify" | "disable">("status");

  // Check 2FA status on mount
  useEffect(() => {
    checkTwofaStatus();
  }, []);

  const checkTwofaStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get("/twofa/status");
      setTwofaEnabled(response.data.twofa_enabled);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check 2FA status");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/twofa/setup");
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setStep("verify");
      setSuccess("Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to set up 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/twofa/verify", { token });
      setSuccess("2FA enabled successfully!");
      setTwofaEnabled(true);
      setStep("status");
      setQrCode(null);
      setSecret(null);
      setToken("");
      
      // Call onClose after a short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify 2FA token");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!token || token.length !== 6) {
      setError("Please enter a 6-digit code to disable 2FA");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/twofa/disable", { token });
      setSuccess("2FA disabled successfully");
      setTwofaEnabled(false);
      setStep("status");
      setToken("");
      
      // Call onClose after a short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === "status") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {/* Status View */}
        {step === "status" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {twofaEnabled ? (
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                ) : (
                  <ShieldOff className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">
                    {twofaEnabled ? "2FA is enabled" : "2FA is disabled"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {twofaEnabled
                      ? "Your account is protected with two-factor authentication"
                      : "Enable 2FA to add extra security"}
                  </p>
                </div>
              </div>
            </div>

            {twofaEnabled ? (
              <Button
                onClick={() => setStep("disable")}
                variant="destructive"
                className="w-full"
              >
                Disable 2FA
              </Button>
            ) : (
              <Button
                onClick={handleSetup}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            )}
          </div>
        )}

        {/* Setup/Verify View */}
        {step === "verify" && qrCode && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <img src={qrCode} alt="2FA QR Code" className="w-64 h-64 border rounded-lg" />
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Can't scan the QR code? Enter this code manually:
                </p>
                <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                  {secret}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Enter the 6-digit code from your authenticator app
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={token}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setToken(value);
                }}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep("status");
                  setQrCode(null);
                  setSecret(null);
                  setToken("");
                  setError("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={loading || token.length !== 6}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Disable View */}
        {step === "disable" && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Warning: Disabling 2FA will make your account less secure. You will need to enter
                your current 6-digit code to confirm.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Enter your current 6-digit 2FA code
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={token}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setToken(value);
                }}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep("status");
                  setToken("");
                  setError("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisable}
                disabled={loading || token.length !== 6}
                variant="destructive"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </Button>
            </div>
          </div>
        )}

        {onClose && (
          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
