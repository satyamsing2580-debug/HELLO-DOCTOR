import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { GeoLocationData } from '../types';
import { locationService } from '../services/locationService';

interface Props {
  onLocationVerified: (location: GeoLocationData) => void;
  verifiedLocation?: GeoLocationData | null;
  manualAddress: string;
  onAddressChange: (address: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export const GpsLocationVerifier: React.FC<Props> = ({
  onLocationVerified,
  verifiedLocation,
  manualAddress,
  onAddressChange,
  required = true,
  label = 'Delivery / Consultation Address & Real-time GPS *',
  placeholder = 'Enter House/Ward No., Landmark, Village/Mohalla, District...',
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addressValidationMsg, setAddressValidationMsg] = useState<string | null>(null);

  const handleFetchGps = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const geo = await locationService.fetchCurrentGpsLocation();
      const areaCheck = locationService.verifyServiceArea(geo.latitude, geo.longitude);

      onLocationVerified(geo);

      // If user hasn't typed an address yet or address is very brief, auto-fill reverse-geocoded address
      if (!manualAddress.trim() || manualAddress.trim().length < 15) {
        if (geo.address && !geo.address.startsWith('Lat:')) {
          onAddressChange(geo.address);
        }
      }

      setAddressValidationMsg(null);
    } catch (err: unknown) {
      setLocationError(err instanceof Error ? err.message : 'Unable to acquire GPS coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddressBlur = () => {
    if (!manualAddress.trim()) return;
    const check = locationService.validateAddress(manualAddress, !!verifiedLocation?.isVerified);
    if (!check.isValid) {
      setAddressValidationMsg(check.error || 'Please enter a genuine, detailed address.');
    } else {
      setAddressValidationMsg(null);
    }
  };

  return (
    <div className="space-y-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>{label}</span>
        </label>
        {verifiedLocation?.isVerified ? (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>GPS Verified</span>
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>GPS Required</span>
          </span>
        )}
      </div>

      {/* GPS Detector Trigger Button */}
      <button
        type="button"
        onClick={handleFetchGps}
        disabled={isLocating}
        className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs ${
          verifiedLocation?.isVerified
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 active:scale-[0.99]'
        }`}
      >
        {isLocating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-current" />
            <span>Detecting Exact Device GPS Coordinates...</span>
          </>
        ) : verifiedLocation?.isVerified ? (
          <>
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span>Exact GPS: {verifiedLocation.latitude.toFixed(6)}°N, {verifiedLocation.longitude.toFixed(6)}°E (Tap to Recalibrate)</span>
          </>
        ) : (
          <>
            <Compass className="w-4 h-4 text-white" />
            <span>Auto-Detect Exact Current Location (Tap Here)</span>
          </>
        )}
      </button>

      {/* Exact Location Details Card */}
      {verifiedLocation?.isVerified && (
        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center space-x-1 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exact Location Verified</span>
            </span>
            <span className="bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full text-[10px]">
              Accuracy: ±{verifiedLocation.accuracy || 5}m
            </span>
          </div>
          {verifiedLocation.address && (
            <p className="text-slate-700 text-[11px] font-medium leading-tight">
              {verifiedLocation.address}
            </p>
          )}
          <div className="flex items-center justify-between pt-1 text-[10px]">
            <span className="text-slate-500">
              Lat: {verifiedLocation.latitude.toFixed(6)}, Lon: {verifiedLocation.longitude.toFixed(6)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${verifiedLocation.latitude},${verifiedLocation.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:text-sky-800 font-bold underline"
            >
              Verify on Map ↗
            </a>
          </div>
        </div>
      )}

      {/* GPS Error & Troubleshooting Instructions */}
      {locationError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed space-y-1">
          <div className="flex items-center space-x-1.5 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>GPS Location Notice</span>
          </div>
          <p>{locationError}</p>
          <p className="text-[10px] text-rose-600 pt-0.5">
            <strong>How to fix:</strong> Open your phone&apos;s Settings &rarr; Location &rarr; Turn ON GPS, then tap &quot;Allow&quot; when requested by the app.
          </p>
        </div>
      )}

      {/* Manual Detailed Address Field with Validation */}
      <div className="space-y-1">
        <textarea
          rows={2}
          required={required}
          value={manualAddress}
          onChange={(e) => {
            onAddressChange(e.target.value);
            if (addressValidationMsg) setAddressValidationMsg(null);
          }}
          onBlur={handleAddressBlur}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-white border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all ${
            addressValidationMsg ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
          }`}
        />
        {addressValidationMsg && (
          <p className="text-[11px] text-rose-600 font-semibold flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{addressValidationMsg}</span>
          </p>
        )}
      </div>

      <p className="text-[10px] text-slate-500 flex items-center justify-between">
        <span>📍 Coverage: Gopalganj & Siwan (Bihar)</span>
        {verifiedLocation?.accuracy && (
          <span className="text-emerald-700 font-medium">Accuracy: ±{verifiedLocation.accuracy}m</span>
        )}
      </p>
    </div>
  );
};
