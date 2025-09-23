import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { ExternalLink, AlertTriangle, CheckCircle, Phone, Settings } from 'lucide-react';

interface PhoneAuthSetupStatusProps {
  onDismiss?: () => void;
}

export const PhoneAuthSetupStatus: React.FC<PhoneAuthSetupStatusProps> = ({ onDismiss }) => {
  return (
    <Alert className="border-orange-200 bg-orange-50 mb-6">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-3">
          <div className="font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Authentication Setup Required
          </div>

          <div className="text-sm space-y-2">
            <p>To use phone authentication, you need to enable it in Firebase Console:</p>

            <div className="bg-white/50 rounded-md p-3 space-y-2">
              <div className="font-medium text-xs uppercase tracking-wide text-orange-700">Setup Steps:</div>

              <div className="space-y-1 text-xs">
                <div className="flex items-start gap-2">
                  <span className="bg-orange-100 text-orange-700 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span>Go to <strong>Firebase Console</strong> → <strong>Authentication</strong> → <strong>Sign-in method</strong></span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="bg-orange-100 text-orange-700 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span>Enable <strong>Phone</strong> authentication provider</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="bg-orange-100 text-orange-700 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span>Add test phone numbers for development (optional)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
              <div className="font-medium text-xs uppercase tracking-wide text-blue-700 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Development Testing
              </div>
              <div className="text-xs text-blue-700">
                <p><strong>Test Phone:</strong> +91 98765 43210</p>
                <p><strong>Test Code:</strong> 123456</p>
                <p className="text-blue-600 mt-1">Add these in Firebase Console → Phone numbers for testing</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
              onClick={() => window.open('https://console.firebase.google.com/project/avrlodgev2/authentication/providers', '_blank')}
            >
              <Settings className="mr-1 h-3 w-3" />
              Open Firebase Console
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>

            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                className="text-orange-600 hover:text-orange-700"
                onClick={onDismiss}
              >
                I'll do this later
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PhoneAuthSetupStatus;