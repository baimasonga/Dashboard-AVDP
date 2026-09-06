import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { SIERRA_LEONE_DISTRICTS } from '../../data/sierraLeoneData';
import { SIERRA_LEONE_GEOJSON } from '../../data/sierraLeoneGeoJson';
import { AVDP_AGRI_FACILITIES, AgriFacility } from '../../data/agriFacilitiesData';
import {
  CommodityType,
  ProjectionScenario,
  COMMODITY_METADATA,
} from '../../data/cropTrendData';
import {
  CropTrendForecastService,
  DistrictForecastResult,
} from '../../services/cropTrendForecastService';
import { CropTrendAnalysisModal } from './CropTrendAnalysisModal';
import {
  GisStatisticalService,
  ClassificationMethod,
  COLOR_RAMPS,
  ClassBreakInterval,
} from '../../services/gisStatisticalService';
import { DistrictMetric } from '../../types';
import {
  MapPin,
  Layers,
  Settings2,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Users,
  TrendingUp,
  Factory,
  Award,
  Filter,
  CheckCircle2,
  X,
  Compass,
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  Sun,
  Globe,
  Satellite,
  BarChart3,
  LineChart,
  Play,
  Pause,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export type MapMetricType =
  | 'rice_yield'
  | 'oil_palm'
  | 'cocoa'
  | 'vegetables'
  | 'ivs_ha'
  | 'beneficiaries'
  | 'cassava_yield'
  | 'me_completion'
  | 'processing';

export type BasemapType = 'voyager' | 'dark' | 'light' | 'osm' | 'satellite';

const CARTO_TOKEN =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CARTO_TOKEN) ||
  '';

const CARTO_API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CARTO_API_BASE_URL) ||
  'https://gcp-us-east1.api.carto.com';

interface SierraLeoneMapProps {
  selectedDistrict?: string | null;
  onSelectDistrict?: (districtName: string | null) => void;
  activeMetric?: MapMetricType;
  height?: string;
  showToolbar?: boolean;
}

// Bounding box for Sierra Leone: [minLat, minLon] to [maxLat, maxLon]
const SIERRA_LEONE_BOUNDS: L.LatLngBoundsLiteral = [
  [6.8, -13.4],
  [10.1, -10.2],
];

const SIERRA_LEONE_CENTER: [number, number] = [8.46, -11.78];

const BASEMAP_URLS: Record<BasemapType, { url: string; attribution: string; maxZoom: number; isCarto?: boolean }> = {
  voyager: {
    url: CARTO_TOKEN
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${CARTO_TOKEN}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
    maxZoom: 20,
    isCarto: true,
  },
  dark: {
    url: CARTO_TOKEN
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_TOKEN}`
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
    maxZoom: 20,
    isCarto: true,
  },
  light: {
    url: CARTO_TOKEN
      ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_TOKEN}`
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
    maxZoom: 20,
    isCarto: true,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
};

export const SierraLeoneMap: React.FC<SierraLeoneMapProps> = ({
  selectedDistrict: externalSelectedDistrict,
  onSelectDistrict,
  activeMetric = 'rice_yield',
  height = 'h-[520px]',
  showToolbar = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const bubblesLayerRef = useRef<L.LayerGroup | null>(null);

  // State
  const [metric, setMetric] = useState<MapMetricType>(activeMetric);
  const [internalSelectedDistrict, setInternalSelectedDistrict] = useState<string | null>(
    externalSelectedDistrict || null
  );
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictMetric | null>(null);
  const [basemap, setBasemap] = useState<BasemapType>('dark');
  const [classification, setClassification] = useState<ClassificationMethod>('jenks');
  const [numClasses, setNumClasses] = useState<number>(5);
  const [fillOpacity, setFillOpacity] = useState<number>(0.75);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [showBubbles, setShowBubbles] = useState<boolean>(false);
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activePalette, setActivePalette] = useState<keyof typeof COLOR_RAMPS>('emerald');

  // Multi-Year Trend Analysis & Forecasting State
  const [isTrendMode, setIsTrendMode] = useState<boolean>(false);
  const [trendCommodity, setTrendCommodity] = useState<CommodityType>('rice');
  const [trendScenario, setTrendScenario] = useState<ProjectionScenario>('avdp_accelerated');
  const [trendYear, setTrendYear] = useState<number>(2026);
  const [trendSubtype, setTrendSubtype] = useState<'yield' | 'production' | 'projected_cagr' | 'yield_gap'>('yield');
  const [isTrendModalOpen, setIsTrendModalOpen] = useState<boolean>(false);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // CARTO Platform API Live Status State
  const [cartoApiStatus, setCartoApiStatus] = useState<{
    pinging: boolean;
    connected: boolean;
    latencyMs?: number;
    statusCode?: number;
    account: string;
    region: string;
    apiBaseUrl: string;
  }>({
    pinging: false,
    connected: false,
    account: 'not-configured',
    region: 'gcp-us-east1',
    apiBaseUrl: CARTO_API_BASE_URL,
  });

  const testCartoApiConnection = useCallback(async () => {
    setCartoApiStatus((prev) => ({ ...prev, pinging: true }));
    try {
      const res = await fetch('/api/carto/status');
      const data = await res.json();
      setCartoApiStatus({
        pinging: false,
        connected: data.authenticated || data.success,
        latencyMs: data.latencyMs,
        statusCode: data.statusCode,
        account: data.account || 'not-configured',
        region: data.region || 'gcp-us-east1',
        apiBaseUrl: data.apiBaseUrl || CARTO_API_BASE_URL,
      });
    } catch {
      setCartoApiStatus((prev) => ({
        ...prev,
        pinging: false,
        connected: false,
      }));
    }
  }, []);

  // Timeline playback timer
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setTrendYear((prev) => (prev >= 2028 ? 2019 : prev + 1));
    }, 1300);
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  // Keep internal state in sync with external props
  useEffect(() => {
    if (activeMetric) setMetric(activeMetric);
  }, [activeMetric]);

  useEffect(() => {
    if (externalSelectedDistrict !== undefined) {
      setInternalSelectedDistrict(externalSelectedDistrict);
    }
  }, [externalSelectedDistrict]);

  // Determine optimal color palette for metric or trend commodity
  useEffect(() => {
    if (isTrendMode) {
      switch (trendCommodity) {
        case 'rice':
          setActivePalette('emerald');
          break;
        case 'cocoa':
          setActivePalette('amber');
          break;
        case 'oil_palm':
          setActivePalette('forest');
          break;
      }
    } else {
      switch (metric) {
        case 'rice_yield':
        case 'ivs_ha':
          setActivePalette('emerald');
          break;
        case 'oil_palm':
        case 'processing':
          setActivePalette('forest');
          break;
        case 'cocoa':
        case 'cassava_yield':
          setActivePalette('amber');
          break;
        case 'vegetables':
          setActivePalette('cyan');
          break;
        case 'me_completion':
          setActivePalette('sky');
          break;
        case 'beneficiaries':
        default:
          setActivePalette('amber_purple');
          break;
      }
    }
  }, [isTrendMode, trendCommodity, metric]);

  const currentDistrictData = useMemo(() => {
    if (!internalSelectedDistrict) return null;
    return (
      SIERRA_LEONE_DISTRICTS.find(
        (d) => d.name.toLowerCase() === internalSelectedDistrict.toLowerCase()
      ) || null
    );
  }, [internalSelectedDistrict]);

  // Statistical calculations across districts (supporting either logframe metrics or predictive trend series)
  const { allValues, stats, breaks, intervals, paletteColors } = useMemo(() => {
    const vals = isTrendMode
      ? SIERRA_LEONE_DISTRICTS.map((d) =>
          CropTrendForecastService.getMapFeatureValue(
            d.name,
            trendCommodity,
            trendYear,
            trendScenario,
            trendSubtype
          ).value
        )
      : SIERRA_LEONE_DISTRICTS.map((d) =>
          GisStatisticalService.getMetricValue(d, metric)
        );

    const computedStats = GisStatisticalService.calculateStats(vals);
    const computedBreaks = GisStatisticalService.computeBreaks(
      vals,
      classification,
      numClasses
    );

    const colors =
      basemap === 'light'
        ? COLOR_RAMPS[activePalette].colors
        : COLOR_RAMPS[activePalette].darkColors;

    let classIntervals: ClassBreakInterval[];
    if (isTrendMode) {
      classIntervals = [];
      const minVal = computedStats.min;
      for (let i = 0; i < computedBreaks.length; i++) {
        const lower = i === 0 ? minVal : computedBreaks[i - 1];
        const upper = computedBreaks[i];
        const count = vals.filter((v) =>
          i === 0 ? v >= lower && v <= upper : v > lower && v <= upper
        ).length;
        const lowerFormatted = CropTrendForecastService.formatMetric(
          lower,
          trendCommodity,
          trendSubtype
        );
        const upperFormatted = CropTrendForecastService.formatMetric(
          upper,
          trendCommodity,
          trendSubtype
        );
        classIntervals.push({
          min: lower,
          max: upper,
          color: colors[Math.min(i, colors.length - 1)],
          count,
          label: `${lowerFormatted} - ${upperFormatted}`,
        });
      }
    } else {
      classIntervals = GisStatisticalService.buildClassIntervals(
        computedBreaks,
        vals,
        colors,
        metric
      );
    }

    return {
      allValues: vals,
      stats: computedStats,
      breaks: computedBreaks,
      intervals: classIntervals,
      paletteColors: colors,
    };
  }, [
    isTrendMode,
    trendCommodity,
    trendYear,
    trendScenario,
    trendSubtype,
    metric,
    classification,
    numClasses,
    activePalette,
    basemap,
  ]);

  // District lookup map
  const districtMap = useMemo(() => {
    const map = new Map<string, DistrictMetric>();
    SIERRA_LEONE_DISTRICTS.forEach((d) => map.set(d.name.toLowerCase().trim(), d));
    return map;
  }, []);

  // Handle district selection
  const handleSelectDistrict = useCallback(
    (name: string | null) => {
      setInternalSelectedDistrict(name);
      onSelectDistrict?.(name);

      if (name && mapInstanceRef.current && geoJsonLayerRef.current) {
        // Zoom to district feature if found
        geoJsonLayerRef.current.eachLayer((layer: any) => {
          if (
            layer.feature?.properties?.name?.toLowerCase().trim() ===
            name.toLowerCase().trim()
          ) {
            const bounds = layer.getBounds();
            mapInstanceRef.current?.flyToBounds(bounds, {
              padding: [40, 40],
              maxZoom: 10,
              duration: 1.2,
            });
          }
        });
      }
    },
    [onSelectDistrict]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
      center: SIERRA_LEONE_CENTER,
      zoom: 7.8,
      minZoom: 7,
      maxZoom: 15,
      maxBounds: [
        [6.4, -13.8],
        [10.5, -9.8],
      ],
      maxBoundsViscosity: 0.9,
      zoomControl: false,
      attributionControl: true,
    });

    // Custom Zoom control position
    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

    // Initial tile layer
    const baseConfig = BASEMAP_URLS[basemap];
    const tileLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Resize observer to ensure map renders smoothly on container layout changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const baseConfig = BASEMAP_URLS[basemap];
    const newTileLayer = L.tileLayer(baseConfig.url, {
      attribution: baseConfig.attribution,
      maxZoom: baseConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [basemap]);

  // Update GeoJSON Choropleth Polygons
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const geoJsonLayer = L.geoJSON(SIERRA_LEONE_GEOJSON as any, {
      filter: (feature) => {
        if (provinceFilter === 'all') return true;
        const d = districtMap.get(feature.properties.name.toLowerCase().trim());
        return d?.province.toLowerCase() === provinceFilter.toLowerCase();
      },
      style: (feature) => {
        if (!feature) return {};
        const districtName = feature.properties.name;
        const district = districtMap.get(districtName.toLowerCase().trim());
        const isSelected =
          internalSelectedDistrict?.toLowerCase().trim() ===
          districtName.toLowerCase().trim();

        if (!district) {
          return {
            fillColor: '#334155',
            weight: 1,
            opacity: 0.8,
            color: '#64748b',
            fillOpacity: 0.3,
          };
        }

        const val = isTrendMode
          ? CropTrendForecastService.getMapFeatureValue(
              district.name,
              trendCommodity,
              trendYear,
              trendScenario,
              trendSubtype
            ).value
          : GisStatisticalService.getMetricValue(district, metric);

        const fillColor = GisStatisticalService.getColor(
          val,
          breaks,
          paletteColors
        );

        return {
          fillColor,
          weight: isSelected ? 3 : 1.5,
          opacity: 0.95,
          color: isSelected ? '#38bdf8' : basemap === 'light' ? '#0f172a' : '#1e293b',
          dashArray: isSelected ? '4, 4' : undefined,
          fillOpacity: isSelected ? Math.min(1, fillOpacity + 0.15) : fillOpacity,
        };
      },
      onEachFeature: (feature, layer) => {
        const districtName = feature.properties.name;
        const district = districtMap.get(districtName.toLowerCase().trim());
        if (!district) return;

        let tooltipContent = '';

        if (isTrendMode) {
          const featVal = CropTrendForecastService.getMapFeatureValue(
            district.name,
            trendCommodity,
            trendYear,
            trendScenario,
            trendSubtype
          );
          const forecast = CropTrendForecastService.getDistrictForecast(
            district.name,
            trendCommodity,
            trendScenario
          );
          const cMeta = COMMODITY_METADATA[trendCommodity];

          tooltipContent = `
            <div class="p-1 min-w-[190px]">
              <div class="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                <span class="font-bold text-white text-xs">${district.name} District</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  featVal.isProjected
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                }">
                  ${trendYear} ${featVal.isProjected ? 'PROJECTION' : 'EMPIRICAL'}
                </span>
              </div>
              <div class="flex items-baseline justify-between gap-2 mt-1">
                <span class="text-[10px] text-slate-300">${cMeta.name}:</span>
                <span class="text-xs font-extrabold text-amber-300">${featVal.formatted}</span>
              </div>
              ${
                forecast
                  ? `
                <div class="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Projected CAGR:</span>
                  <span class="font-bold text-emerald-400">${forecast.projectedCagrPct >= 0 ? '+' : ''}${forecast.projectedCagrPct}% / yr</span>
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Agro-Potential:</span>
                  <span class="font-bold text-slate-200">${forecast.potentialFrontierYield} ${cMeta.unitYield}</span>
                </div>
                <div class="mt-1 pt-1 border-t border-slate-800 text-[9px] text-slate-400">
                  <span class="text-emerald-400 font-semibold">AVDP:</span> ${forecast.dominantIntervention}
                </div>
              `
                  : ''
              }
            </div>
          `;
        } else {
          const val = GisStatisticalService.getMetricValue(district, metric);
          const formattedVal = GisStatisticalService.formatMetricValue(val, metric);
          const scorecard = GisStatisticalService.getDistrictScorecard(
            district,
            SIERRA_LEONE_DISTRICTS,
            metric
          );

          tooltipContent = `
            <div class="p-1 min-w-[170px]">
              <div class="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                <span class="font-bold text-white text-xs">${district.name} District</span>
                <span class="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">${district.province}</span>
              </div>
              <div class="flex items-baseline justify-between gap-2 mt-1">
                <span class="text-[10px] text-slate-300 capitalize">${metric.replace(/_/g, ' ')}:</span>
                <span class="text-xs font-extrabold text-amber-300">${formattedVal}</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span>National Rank:</span>
                <span class="font-bold text-white">#${scorecard.rank} of 16</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Women Beneficiaries:</span>
                <span class="font-bold text-emerald-400">${district.womenBeneficiaryPct ?? 45}%</span>
              </div>
            </div>
          `;
        }

        layer.bindTooltip(tooltipContent, {
          sticky: true,
          direction: 'auto',
          className: 'custom-leaflet-tooltip',
        });

        // Mouse interactions
        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 2.8,
              color: '#34d399',
              fillOpacity: Math.min(1, fillOpacity + 0.2),
            });
            target.bringToFront();
            setHoveredDistrict(district);
          },
          mouseout: (e) => {
            const target = e.target;
            const isSelected =
              internalSelectedDistrict?.toLowerCase().trim() ===
              districtName.toLowerCase().trim();
            target.setStyle({
              weight: isSelected ? 3 : 1.5,
              color: isSelected
                ? '#38bdf8'
                : basemap === 'light'
                ? '#0f172a'
                : '#1e293b',
              fillOpacity: isSelected ? Math.min(1, fillOpacity + 0.15) : fillOpacity,
            });
          },
          click: () => {
            handleSelectDistrict(district.name);
          },
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;
  }, [
    metric,
    classification,
    numClasses,
    breaks,
    paletteColors,
    fillOpacity,
    basemap,
    provinceFilter,
    internalSelectedDistrict,
    districtMap,
    handleSelectDistrict,
    isTrendMode,
    trendCommodity,
    trendYear,
    trendScenario,
    trendSubtype,
  ]);

  // Update Centroid Labels & Badges
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
    }

    if (!showLabels) return;

    const markersGroup = L.layerGroup();

    SIERRA_LEONE_GEOJSON.features.forEach((feat: any) => {
      const name = feat.properties.name;
      const district = districtMap.get(name.toLowerCase().trim());
      if (!district) return;

      if (
        provinceFilter !== 'all' &&
        district.province.toLowerCase() !== provinceFilter.toLowerCase()
      ) {
        return;
      }

      const lat = feat.properties.center_lat;
      const lon = feat.properties.center_lon;

      let formattedVal = '';
      let subtextBadge = '';

      if (isTrendMode) {
        const featVal = CropTrendForecastService.getMapFeatureValue(
          district.name,
          trendCommodity,
          trendYear,
          trendScenario,
          trendSubtype
        );
        formattedVal = featVal.formatted;
        const forecast = CropTrendForecastService.getDistrictForecast(
          district.name,
          trendCommodity,
          trendScenario
        );
        if (forecast) {
          subtextBadge = `${forecast.projectedCagrPct >= 0 ? '▲' : '▼'}${forecast.projectedCagrPct}%`;
        }
      } else {
        const val = GisStatisticalService.getMetricValue(district, metric);
        formattedVal = GisStatisticalService.formatMetricValue(val, metric);
      }

      const isSelected =
        internalSelectedDistrict?.toLowerCase().trim() ===
        district.name.toLowerCase().trim();

      const labelHtml = `
        <div class="transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
          <div class="px-1.5 py-0.5 rounded shadow-md border text-[10px] font-semibold whitespace-nowrap transition-all ${
            isSelected
              ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold scale-110'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/80 backdrop-blur-xs'
          }">
            <span class="block leading-none">${district.name}</span>
            <span class="block text-[9px] text-emerald-400 font-normal leading-tight">
              ${formattedVal} ${subtextBadge ? `<span class="text-amber-300 font-mono text-[8px] font-bold">${subtextBadge}</span>` : ''}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: labelHtml,
        className: 'district-centroid-label',
        iconSize: [0, 0],
      });

      L.marker([lat, lon], { icon: customIcon, interactive: false }).addTo(
        markersGroup
      );
    });

    markersGroup.addTo(map);
    markersLayerRef.current = markersGroup;
  }, [
    showLabels,
    metric,
    provinceFilter,
    internalSelectedDistrict,
    districtMap,
    isTrendMode,
    trendCommodity,
    trendYear,
    trendScenario,
    trendSubtype,
  ]);

  // Update Agro-Facilities Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (facilitiesLayerRef.current) {
      map.removeLayer(facilitiesLayerRef.current);
    }

    if (!showFacilities) return;

    const facilitiesGroup = L.layerGroup();

    AVDP_AGRI_FACILITIES.forEach((facility) => {
      if (
        provinceFilter !== 'all' &&
        facility.province.toLowerCase() !== provinceFilter.toLowerCase()
      ) {
        return;
      }

      let iconBg = 'bg-emerald-600';
      let iconBorder = 'border-emerald-300';
      let facilityEmoji = '🌾';

      if (facility.type === 'oil_palm_mill') {
        iconBg = 'bg-amber-600';
        iconBorder = 'border-amber-300';
        facilityEmoji = '🌴';
      } else if (facility.type === 'cocoa_hub') {
        iconBg = 'bg-amber-800';
        iconBorder = 'border-amber-400';
        facilityEmoji = '🍫';
      } else if (facility.type === 'veg_solar') {
        iconBg = 'bg-cyan-600';
        iconBorder = 'border-cyan-300';
        facilityEmoji = '🥬';
      } else if (facility.type === 'seed_center') {
        iconBg = 'bg-sky-600';
        iconBorder = 'border-sky-300';
        facilityEmoji = '🌱';
      }

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-6 h-6 rounded-full ${iconBg} border-2 ${iconBorder} flex items-center justify-center text-[12px] shadow-lg transform transition-transform hover:scale-125">
            ${facilityEmoji}
          </div>
          <span class="absolute -bottom-1 -right-1 flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      `;

      const facilityIcon = L.divIcon({
        html: markerHtml,
        className: 'facility-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([facility.lat, facility.lon], {
        icon: facilityIcon,
      });

      const popupHtml = `
        <div class="p-2.5 max-w-xs">
          <div class="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
            <span class="text-base">${facilityEmoji}</span>
            <span>${facility.name}</span>
          </div>
          <div class="text-[11px] text-emerald-400 font-semibold mb-1">
            ${facility.district} District &bull; ${facility.province}
          </div>
          <p class="text-[11px] text-slate-300 leading-snug mb-2">${facility.capacityDescription}</p>
          <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-700/80">
            <strong>Managed by:</strong> ${facility.operator}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(facilitiesGroup);
    });

    facilitiesGroup.addTo(map);
    facilitiesLayerRef.current = facilitiesGroup;
  }, [showFacilities, provinceFilter]);

  // Update Proportional Bubbles Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (bubblesLayerRef.current) {
      map.removeLayer(bubblesLayerRef.current);
    }

    if (!showBubbles) return;

    const bubblesGroup = L.layerGroup();
    const maxVal = stats.max || 1;

    SIERRA_LEONE_GEOJSON.features.forEach((feat: any) => {
      const name = feat.properties.name;
      const district = districtMap.get(name.toLowerCase().trim());
      if (!district) return;

      if (
        provinceFilter !== 'all' &&
        district.province.toLowerCase() !== provinceFilter.toLowerCase()
      ) {
        return;
      }

      const lat = feat.properties.center_lat;
      const lon = feat.properties.center_lon;
      const val = GisStatisticalService.getMetricValue(district, metric);

      // Proportional radius between 8px and 36px
      const radius = Math.max(8, Math.min(38, Math.sqrt(val / maxVal) * 36));

      const circle = L.circleMarker([lat, lon], {
        radius,
        fillColor: '#f59e0b',
        color: '#fbbf24',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.45,
      });

      circle.bindTooltip(
        `<b>${district.name}:</b> ${GisStatisticalService.formatMetricValue(
          val,
          metric
        )}`,
        { sticky: true }
      );
      circle.addTo(bubblesGroup);
    });

    bubblesGroup.addTo(map);
    bubblesLayerRef.current = bubblesGroup;
  }, [showBubbles, metric, stats.max, provinceFilter, districtMap]);

  // Reset to full Sierra Leone bounds
  const handleResetBounds = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyToBounds(SIERRA_LEONE_BOUNDS, {
        padding: [20, 20],
        duration: 1.2,
      });
      handleSelectDistrict(null);
    }
  };

  // Export GeoJSON with indicators embedded
  const handleExportGeoJson = () => {
    const enriched = GisStatisticalService.generateEnrichedGeoJson(
      SIERRA_LEONE_GEOJSON,
      SIERRA_LEONE_DISTRICTS
    );
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(enriched, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `sierra_leone_avdp_gis_${metric}_${new Date().toISOString().slice(0, 10)}.geojson`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export summary CSV
  const handleExportCsv = () => {
    const headers = [
      'District',
      'Province',
      'RiceYield_MT_Ha',
      'OilPalm_MT',
      'Cocoa_MT',
      'Vegetables_MT',
      'IVS_Ha',
      'Beneficiary_HH',
      'FBO_Count',
      'ME_Completion_Pct',
      'Processing_Mills',
      'FeederRoads_Km',
    ];

    const rows = SIERRA_LEONE_DISTRICTS.map((d) => [
      d.name,
      d.province,
      d.riceYieldMTPerHa,
      d.oilPalmYieldMT,
      d.cocoaProductionMT,
      d.vegetablesYieldMT ?? 0,
      d.ivsDevelopedHa ?? 0,
      d.beneficiaryHouseholds,
      d.fboCount,
      d.meCompletionRate,
      d.activeProcessingMills,
      d.feederRoadsRehabKm,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute(
      'download',
      `sierra_leone_avdp_district_data_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className={`relative w-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & METRIC SELECTOR TOOLBAR                       */}
      {/* ------------------------------------------------------------- */}
      {showToolbar && (
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Title & Badge */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-950/90 border border-emerald-500/40 rounded-lg text-emerald-400 shadow-xs">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Sierra Leone AVDP Geospatial Intelligence GIS Map
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    16 ADM2 Districts &bull; UN OCHA COD-AB
                  </span>
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-950/80 text-teal-300 border border-teal-600/50 hover:bg-teal-900/60 flex items-center gap-1 transition-colors cursor-pointer"
                    title={`CARTO Platform API Base URL: ${CARTO_API_BASE_URL} (Region: GCP US East 1) - Click to inspect`}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-teal-400" />
                    <span>CARTO API &bull; gcp-us-east1</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Interactive multi-layer cartography, natural breaks classification, and agro-ecological profiling
                </p>
              </div>
            </div>

            {/* Quick Actions & GIS Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Province Filter */}
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/70 rounded-lg px-2 py-1 text-xs text-slate-300">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  id="gis-province-filter"
                  aria-label="Filter districts by province"
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-white">
                    All Provinces (16)
                  </option>
                  <option value="Eastern" className="bg-slate-900 text-white">
                    Eastern Province
                  </option>
                  <option value="Northern" className="bg-slate-900 text-white">
                    Northern Province
                  </option>
                  <option value="North Western" className="bg-slate-900 text-white">
                    North Western Province
                  </option>
                  <option value="Southern" className="bg-slate-900 text-white">
                    Southern Province
                  </option>
                  <option value="Western" className="bg-slate-900 text-white">
                    Western Area
                  </option>
                </select>
              </div>

              {/* District Jump */}
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/70 rounded-lg px-2 py-1 text-xs text-slate-300">
                <Search className="w-3 h-3 text-slate-400" />
                <select
                  id="gis-district-select"
                  aria-label="Jump directly to a district"
                  value={internalSelectedDistrict || ''}
                  onChange={(e) => handleSelectDistrict(e.target.value || null)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[130px]"
                >
                  <option value="" className="bg-slate-900 text-white">
                    Jump to District...
                  </option>
                  {SIERRA_LEONE_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name} className="bg-slate-900 text-white">
                      {d.name} ({d.province})
                    </option>
                  ))}
                </select>
              </div>

              {/* Settings / Cartography Drawer Toggle */}
              <button
                id="gis-toggle-settings"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                  isSettingsOpen
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
                title="GIS Styling & Layer Settings"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Layers &amp; Class</span>
              </button>

              {/* Reset Zoom */}
              <button
                id="gis-reset-bounds"
                onClick={handleResetBounds}
                className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs"
                title="Reset map to Sierra Leone bounds"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen */}
              <button
                id="gis-fullscreen-toggle"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen GIS'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Mode Switcher: Logframe Indicators vs Multi-Year Crop Trends */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  id="map-mode-indicators"
                  onClick={() => {
                    setIsTrendMode(false);
                    setIsPlayingTimeline(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    !isTrendMode
                      ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Logframe Indicators</span>
                </button>

                <button
                  id="map-mode-crop-trends"
                  onClick={() => {
                    setIsTrendMode(true);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    isTrendMode
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/50'
                      : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Multi-Year Trends &amp; Projections</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                    2019&ndash;2027 (2028 Horizon)
                  </span>
                </button>
              </div>

              {isTrendMode && (
                <button
                  id="open-trend-inspector-btn"
                  onClick={() => setIsTrendModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deep Analytical Charts &amp; Rankings</span>
                </button>
              )}
            </div>

            {isTrendMode && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Agro-Econometric Scenario:</span>
                <select
                  aria-label="Agro-econometric projection scenario"
                  value={trendScenario}
                  onChange={(e) => setTrendScenario(e.target.value as ProjectionScenario)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none"
                >
                  <option value="avdp_accelerated">✨ AVDP Accelerated (+45% Yield Growth)</option>
                  <option value="baseline">📈 Historical Baseline (OLS Continuation)</option>
                  <option value="climate_risk">⚠️ Climate Risk (Monsoon Variability &amp; Stress)</option>
                </select>
              </div>
            )}
          </div>

          {/* Sub-toolbar: When NOT in Trend Mode -> Standard Indicator Pills */}
          {!isTrendMode && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-emerald-400" /> Indicator:
              </span>

              {[
                { id: 'rice_yield', label: 'Rice (MT/Ha)', color: 'emerald' },
                { id: 'oil_palm', label: 'Oil Palm (MT)', color: 'emerald' },
                { id: 'cocoa', label: 'Cocoa (MT)', color: 'amber' },
                { id: 'vegetables', label: 'Vegetables (MT)', color: 'cyan' },
                { id: 'ivs_ha', label: 'IVS Swamps (Ha)', color: 'emerald' },
                { id: 'beneficiaries', label: 'Smallholders (HH)', color: 'purple' },
                { id: 'me_completion', label: 'M&E Rate (%)', color: 'sky' },
                { id: 'processing', label: 'Agro-Mills (Count)', color: 'amber' },
              ].map((item) => (
                <button
                  key={item.id}
                  id={`map-btn-metric-${item.id}`}
                  onClick={() => setMetric(item.id as MapMetricType)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-all ${
                    metric === item.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Sub-toolbar: When IN Trend Mode -> Interactive Commodity, Metric & Timeline Slider */}
          {isTrendMode && (
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90 flex flex-col gap-2.5 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Commodity Selection */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Commodity:
                  </span>
                  {(['rice', 'cocoa', 'oil_palm'] as CommodityType[]).map((c) => {
                    const cMeta = COMMODITY_METADATA[c];
                    const isSelected = trendCommodity === c;
                    return (
                      <button
                        key={c}
                        id={`map-trend-commodity-${c}`}
                        onClick={() => setTrendCommodity(c)}
                        className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-slate-800 text-white border shadow-xs'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                        style={isSelected ? { borderColor: `${cMeta.accentColor}90` } : {}}
                      >
                        <span>{cMeta.icon}</span>
                        <span>{cMeta.shortName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Metric Subtype: Yield vs Production vs CAGR vs Gap */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Choropleth Variable:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      id="trend-sub-yield"
                      onClick={() => setTrendSubtype('yield')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all ${
                        trendSubtype === 'yield'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Yield ({COMMODITY_METADATA[trendCommodity].unitYield})
                    </button>
                    <button
                      id="trend-sub-production"
                      onClick={() => setTrendSubtype('production')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all ${
                        trendSubtype === 'production'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Total Production ({COMMODITY_METADATA[trendCommodity].unitProd})
                    </button>
                    <button
                      id="trend-sub-cagr"
                      onClick={() => setTrendSubtype('projected_cagr')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all ${
                        trendSubtype === 'projected_cagr'
                          ? 'bg-slate-800 text-emerald-400 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Proj. CAGR (%)
                    </button>
                    <button
                      id="trend-sub-gap"
                      onClick={() => setTrendSubtype('yield_gap')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all ${
                        trendSubtype === 'yield_gap'
                          ? 'bg-slate-800 text-amber-300 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Yield Frontier Attained (%)
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline Year Scrubber & Animation Engine */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    id="map-timeline-play"
                    onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      isPlayingTimeline
                        ? 'bg-amber-600 text-white hover:bg-amber-500'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {isPlayingTimeline ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause Trajectory</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Timeline Animation</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-slate-300 font-mono text-xs">
                    <span className="text-slate-400">Year:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-black border ${
                        trendYear > 2026
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                          : 'bg-slate-800 text-white border-slate-700'
                      }`}
                    >
                      {trendYear} {trendYear > 2026 ? '• ECONOMETRIC PROJECTION' : '• EMPIRICAL BASELINE'}
                    </span>
                  </div>
                </div>

                {/* Steppers */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028].map((yr) => {
                    const isSelected = yr === trendYear;
                    const isFuture = yr > 2026;
                    return (
                      <button
                        key={yr}
                        onClick={() => setTrendYear(yr)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-md scale-105'
                            : isFuture
                            ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/40'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. GIS SETTINGS SLIDE-OUT PANEL                                */}
      {/* ------------------------------------------------------------- */}
      {isSettingsOpen && (
        <div className="bg-slate-900/95 border-b border-slate-800 p-3.5 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-150 z-20">
          {/* Basemap Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Basemap Cartography
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'voyager', label: 'CARTO Voyager', icon: '🌿', tag: 'Auth HD' },
                { id: 'dark', label: 'CARTO Dark', icon: '🌑', tag: 'Auth' },
                { id: 'light', label: 'CARTO Positron', icon: '☀️', tag: 'Auth' },
                { id: 'satellite', label: 'Esri Satellite', icon: '🛰️' },
                { id: 'osm', label: 'OSM Standard', icon: '🗺️' },
              ].map((b) => (
                <button
                  key={b.id}
                  id={`gis-basemap-${b.id}`}
                  onClick={() => setBasemap(b.id as BasemapType)}
                  className={`px-2 py-1.5 rounded-md border text-left flex items-center justify-between gap-1 transition-all ${
                    basemap === b.id
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{b.icon}</span>
                    <span className="text-[11px] truncate">{b.label}</span>
                  </div>
                  {b.tag && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                      {b.tag}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Statistical Classification Method */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Classification Method
            </label>
            <select
              id="gis-classification-select"
              aria-label="Select classification method"
              value={classification}
              onChange={(e) => setClassification(e.target.value as ClassificationMethod)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="jenks">Jenks Natural Breaks (Optimal Clustering)</option>
              <option value="quantiles">Quantiles (Equal Frequency per Bin)</option>
              <option value="equal_interval">Equal Interval (Uniform Steps)</option>
            </select>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">Class Intervals:</span>
              <div className="flex items-center gap-1">
                {[3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumClasses(n)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      numClasses === n
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {n} Bins
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Layer Overlays */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              GIS Overlays &amp; Symbols
            </label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>District Names &amp; Badges</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={showFacilities}
                  onChange={(e) => setShowFacilities(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>AVDP Agro-Mills &amp; Seed Hubs ({AVDP_AGRI_FACILITIES.length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={showBubbles}
                  onChange={(e) => setShowBubbles(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Proportional Bubble Scaling</span>
              </label>
            </div>
          </div>

          {/* Opacity Slider & Export Tools */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Fill Opacity:</span>
                <span className="font-bold text-emerald-400">{Math.round(fillOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                id="gis-export-geojson"
                onClick={handleExportGeoJson}
                className="flex-1 py-1 px-2 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1"
                title="Export GeoJSON with AVDP statistics"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>GeoJSON</span>
              </button>
              <button
                id="gis-export-csv"
                onClick={handleExportCsv}
                className="flex-1 py-1 px-2 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1"
                title="Export District Table CSV"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>CSV Table</span>
              </button>
            </div>
          </div>

          {/* CARTO Spatial Engine & Authenticated Token Strip */}
          <div className="sm:col-span-2 lg:col-span-4 bg-slate-950/80 border border-teal-500/40 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 mt-1">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-400 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-white">CARTO Cloud Platform API</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-teal-400" /> Account: ac_sp4wv3nz
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                    Region: gcp-us-east1
                  </span>
                  {cartoApiStatus.latencyMs !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-700/50">
                      {cartoApiStatus.latencyMs}ms latency
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-slate-300">
                  <span className="font-mono text-teal-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {CARTO_API_BASE_URL}
                  </span>
                  <span className="text-slate-400 text-[10px]">&bull; Authenticated Vector &amp; Raster Basemaps CDN (cartocdn.com)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testCartoApiConnection}
                disabled={cartoApiStatus.pinging}
                className="px-2.5 py-1 rounded bg-teal-900/60 border border-teal-500/50 hover:bg-teal-800/80 text-teal-200 text-[11px] font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                title="Ping CARTO Cloud API"
              >
                <RotateCcw className={`w-3 h-3 ${cartoApiStatus.pinging ? 'animate-spin' : ''}`} />
                <span>{cartoApiStatus.pinging ? 'Pinging...' : 'Test CARTO API'}</span>
              </button>
              <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-mono text-[10px]">
                256x256 @2x Retina
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MAP CANVAS VIEWPORT                                        */}
      {/* ------------------------------------------------------------- */}
      <div className={`relative w-full ${isFullscreen ? 'h-full flex-1' : height}`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating North Arrow / Compass */}
        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 border border-slate-700/70 backdrop-blur-xs rounded-lg p-2 text-center shadow-lg pointer-events-none">
          <div className="w-6 h-6 mx-auto flex items-center justify-center font-serif text-[11px] font-black text-amber-400">
            N
          </div>
          <div className="w-1 h-3 bg-amber-400 mx-auto rounded-xs -mt-1"></div>
          <div className="w-1 h-3 bg-slate-600 mx-auto rounded-xs"></div>
          <span className="text-[8px] font-mono text-slate-400 block mt-0.5">WGS84</span>
        </div>

        {/* Floating Quick Summary Badge */}
        <div className="absolute top-3 right-12 z-10 hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xl text-xs">
          {isTrendMode ? (
            <>
              <div className="flex items-center gap-1 text-slate-400">
                <span>{COMMODITY_METADATA[trendCommodity].shortName} ({trendYear}):</span>
                <span className="font-bold text-amber-300">
                  {trendSubtype === 'production'
                    ? `${Math.round(stats.sum).toLocaleString()} MT`
                    : `${stats.mean.toFixed(2)} ${COMMODITY_METADATA[trendCommodity].unitYield}`}
                </span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex items-center gap-1 text-slate-400">
                <span>Target 2027:</span>
                <span className="font-bold text-emerald-400">
                  {(COMMODITY_METADATA[trendCommodity].projectClosureTargetProduction || COMMODITY_METADATA[trendCommodity].nationalTarget2030Production).toLocaleString()} MT
                </span>
              </div>
              <button
                onClick={() => setIsTrendModalOpen(true)}
                className="ml-1 px-2 py-0.5 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1"
              >
                <LineChart className="w-2.5 h-2.5" />
                <span>Charts</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 text-slate-400">
                <span>National Total:</span>
                <span className="font-bold text-white">
                  {GisStatisticalService.formatMetricValue(stats.sum, metric)}
                </span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex items-center gap-1 text-slate-400">
                <span>Mean:</span>
                <span className="font-bold text-emerald-400">
                  {GisStatisticalService.formatMetricValue(stats.mean, metric)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. DISTRICT DOSSIER SLIDE-IN CARD (ON SELECT)                 */}
        {/* ------------------------------------------------------------- */}
        {currentDistrictData && (
          <div className="absolute bottom-4 right-4 z-20 w-84 max-w-[calc(100%-2rem)] bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    {currentDistrictData.name} District
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                    {currentDistrictData.province}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentDistrictData.fboCount} FBOs &bull; {currentDistrictData.beneficiaryHouseholds.toLocaleString()} Smallholders
                </div>
              </div>
              <button
                id="gis-close-dossier"
                onClick={() => handleSelectDistrict(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scorecard Highlights or Multi-Year Trend Highlights */}
            {isTrendMode ? (
              (() => {
                const forecast = CropTrendForecastService.getDistrictForecast(
                  currentDistrictData.name,
                  trendCommodity,
                  trendScenario
                );
                const cMeta = COMMODITY_METADATA[trendCommodity];
                const activePoint =
                  forecast?.timeline.find((t) => t.year === trendYear) ||
                  forecast?.timeline[forecast.timeline.length - 1];
                const baselinePoint =
                  forecast?.timeline.find((t) => t.year === 2026) ||
                  forecast?.timeline[0];
                const pointClosure =
                  forecast?.timeline.find((t) => t.year === 2027) ||
                  forecast?.timeline[forecast.timeline.length - 1];

                return (
                  <div className="space-y-2.5 text-xs">
                    {/* Active Trend Focus */}
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>{cMeta.name} &bull; {trendYear}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {activePoint?.isProjected ? 'Projected' : 'Empirical'}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-black text-white">
                          {activePoint?.yieldMTPerHa.toFixed(2)} {cMeta.unitYield}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center">
                          <ArrowUpRight className="w-3 h-3 inline" />
                          {forecast?.projectedCagrPct}% CAGR
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>Cultivated Output:</span>
                        <span className="font-semibold text-slate-200">
                          {Math.round(activePoint?.productionMT ?? 0).toLocaleString()} {cMeta.unitProd}
                        </span>
                      </div>
                    </div>

                    {/* 2026 vs 2027 Multi-Year Horizon Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">2026 Baseline</span>
                        <span className="font-bold text-white">
                          {baselinePoint?.yieldMTPerHa.toFixed(2)} {cMeta.unitYield}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {Math.round(baselinePoint?.productionMT ?? 0).toLocaleString()} MT
                        </span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-amber-400 block">2027 Closure Proj.</span>
                        <span className="font-bold text-amber-300">
                          {pointClosure?.yieldMTPerHa.toFixed(2)} {cMeta.unitYield}
                        </span>
                        <span className="text-[10px] text-emerald-400 block">
                          +{((pointClosure?.yieldMTPerHa ?? 0) - (baselinePoint?.yieldMTPerHa ?? 0)).toFixed(2)} MT/Ha gain
                        </span>
                      </div>
                    </div>

                    {/* Agro-Frontier & Intervention */}
                    <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Frontier Attainment:</span>
                        <span className="font-bold text-emerald-400">
                          {activePoint?.yieldGapPct}% of {forecast?.potentialFrontierYield} {cMeta.unitYield}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        <span className="text-emerald-400 font-semibold">AVDP Intervention: </span>
                        {forecast?.dominantIntervention}
                      </div>
                    </div>

                    <button
                      id="dossier-open-trend-modal"
                      onClick={() => setIsTrendModalOpen(true)}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Inspect Multi-Year Charts &amp; Scenarios</span>
                    </button>
                  </div>
                );
              })()
            ) : (
              (() => {
                const card = GisStatisticalService.getDistrictScorecard(
                  currentDistrictData,
                  SIERRA_LEONE_DISTRICTS,
                  metric
                );
                return (
                  <div className="space-y-2.5">
                    {/* Active Metric Focus */}
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="capitalize">{metric.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Rank #{card.rank} of 16
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-black text-white">{card.formattedValue}</span>
                        <span
                          className={`text-xs font-bold ${
                            card.zScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {card.zScore >= 0 ? '+' : ''}
                          {card.zScore.toFixed(2)}&sigma; ({Math.round(card.pctOfMean)}% of Mean)
                        </span>
                      </div>
                    </div>

                    {/* 4 Multi-Crop Statistics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Rice &amp; IVS Developed</span>
                        <span className="font-bold text-white">
                          {currentDistrictData.riceYieldMTPerHa} MT/Ha
                        </span>
                        <span className="text-[10px] text-emerald-400 block">
                          {(currentDistrictData.ivsDevelopedHa ?? 0).toLocaleString()} Ha IVS
                        </span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Oil Palm &amp; Cocoa</span>
                        <span className="font-bold text-white">
                          {currentDistrictData.oilPalmYieldMT.toLocaleString()} MT Palm
                        </span>
                        <span className="text-[10px] text-amber-400 block">
                          {currentDistrictData.cocoaProductionMT.toLocaleString()} MT Cocoa
                        </span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Inclusion Disaggregation</span>
                        <span className="font-bold text-emerald-300">
                          {currentDistrictData.womenBeneficiaryPct ?? 45}% Women
                        </span>
                        <span className="text-[10px] text-cyan-400 block">
                          {currentDistrictData.youthBeneficiaryPct ?? 40}% Youth
                        </span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Agro-Mills &amp; Roads</span>
                        <span className="font-bold text-white">
                          {currentDistrictData.activeProcessingMills} Active Hubs
                        </span>
                        <span className="text-[10px] text-sky-400 block">
                          {currentDistrictData.feederRoadsRehabKm} km Roads
                        </span>
                      </div>
                    </div>

                    {/* M&E Progress Bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Logframe Delivery Score:</span>
                        <span className="font-bold text-emerald-400">
                          {currentDistrictData.meCompletionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${currentDistrictData.meCompletionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. BOTTOM INTERACTIVE CHOROPLETH LEGEND & STATISTICAL METRICS */}
      {/* ------------------------------------------------------------- */}
      <div className="p-2.5 bg-slate-900/95 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Dynamic Class Breaks Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            {isTrendMode
              ? `${COMMODITY_METADATA[trendCommodity].shortName} (${trendYear}) Breaks:`
              : `${classification.replace('_', ' ')} Intervals:`}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {intervals.map((inv, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/60 text-[11px]"
              >
                <div
                  className="w-3.5 h-3.5 rounded-xs border border-slate-900/80 flex-shrink-0"
                  style={{ backgroundColor: inv.color }}
                />
                <span className="text-slate-300 font-medium">{inv.label}</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-slate-900 text-emerald-400">
                  {inv.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Parametric Stats Pills */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap justify-end">
          <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800">
            <span>Range:</span>
            <span className="font-bold text-slate-200">
              {isTrendMode
                ? `${CropTrendForecastService.formatMetric(stats.min, trendCommodity, trendSubtype)} – ${CropTrendForecastService.formatMetric(stats.max, trendCommodity, trendSubtype)}`
                : `${GisStatisticalService.formatMetricValue(stats.min, metric)} – ${GisStatisticalService.formatMetricValue(stats.max, metric)}`}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800">
            <span>Std Dev (&sigma;):</span>
            <span className="font-bold text-slate-200">{stats.stdDev.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800">
            <span>Districts:</span>
            <span className="font-bold text-emerald-400">16/16</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. MULTI-YEAR TREND ANALYSIS & PROJECTION MODAL               */}
      {/* ------------------------------------------------------------- */}
      <CropTrendAnalysisModal
        isOpen={isTrendModalOpen}
        onClose={() => setIsTrendModalOpen(false)}
        selectedDistrict={internalSelectedDistrict}
        onSelectDistrict={(dist) => handleSelectDistrict(dist)}
        activeCommodity={trendCommodity}
        onChangeCommodity={(c) => setTrendCommodity(c)}
        activeScenario={trendScenario}
        onChangeScenario={(s) => setTrendScenario(s)}
        activeYear={trendYear}
        onChangeYear={(yr) => setTrendYear(yr)}
        isPlayingTimeline={isPlayingTimeline}
        onTogglePlayTimeline={() => setIsPlayingTimeline(!isPlayingTimeline)}
      />
    </div>
  );
};
