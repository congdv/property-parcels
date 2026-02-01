import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import type { Filters } from '../../types/filters';

const FILTERS_KEY = 'parcelFilters';

function formatLabel(min: number | null | undefined, max: number | null | undefined, type: string) {
  if (type === 'price') {
    if ((max != null && max !== 10000000 )|| (min != null && min !== 0)) {
      min = min ?? 0;
      max = max ?? 10000000;
      return `\$${min.toLocaleString()} - \$${max.toLocaleString()}`
    }
    return 'Price'
  } else {
    if ((max != null && max !== 10000 ) || (min != null && min !== 0)) {
      min = min ?? 0;
      max = max ?? 10000;
      return `\$${min.toLocaleString()} - \$${max.toLocaleString()}`
    }
    return 'Size'
  }
}

const Toolbar: React.FC<{ initialFilters?: Filters; onFiltersChange?: (f: Filters) => void }> = ({
  initialFilters,
  onFiltersChange,
}) => {
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minSize, setMinSize] = useState<number | ''>('');
  const [maxSize, setMaxSize] = useState<number | ''>('');
  const [priceAnchor, setPriceAnchor] = useState<HTMLButtonElement | null>(null);
  const [priceSliderValue, setPriceSliderValue] = useState<number[]>([0, 10000000]);
  const [sizeAnchor, setSizeAnchor] = useState<HTMLButtonElement | null>(null);
  const [sizeSliderValue, setSizeSliderValue] = useState<number[]>([0, 10000]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Filters | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTERS_KEY);
      const parsed: Filters | null = raw ? JSON.parse(raw) : null;
      const start = parsed ?? initialFilters ?? {};
      if (start.minPrice != null) setMinPrice(start.minPrice);
      if (start.maxPrice != null) setMaxPrice(start.maxPrice);
      if (start.minSize != null) setMinSize(start.minSize);
      else setMinSize('');
      if (start.maxSize != null) setMaxSize(start.maxSize);
      else setMaxSize('');
    } catch (e) {
      // ignore
    }
  }, [initialFilters]);

  const handleSave = () => {
    const filters: Filters = {
      minPrice: typeof minPrice === 'number' ? minPrice : null,
      maxPrice: typeof maxPrice === 'number' ? maxPrice : null,
      minSize: typeof minSize === 'number' ? minSize : null,
      maxSize: typeof maxSize === 'number' ? maxSize : null,
    };
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    } catch (e) {
      // ignore
    }
    if (onFiltersChange) onFiltersChange(filters);
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinSize('');
    setMaxSize('');
    try {
      localStorage.removeItem(FILTERS_KEY);
    } catch (e) {}
    if (onFiltersChange) onFiltersChange({});
  };

  const handlePriceClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setPriceAnchor(e.currentTarget);
    const min = typeof minPrice === 'number' ? minPrice : 0;
    const max = typeof maxPrice === 'number' ? maxPrice : 10000000;
    setPriceSliderValue([min, max]);
  };

  const formatPriceValue = (v: number) => {
    if (v >= 10000000) {
      return `$${v.toLocaleString()}+`;
    }
    return `$${v.toLocaleString()}`;
  };

  const handlePriceClose = () => setPriceAnchor(null);

  const applyPrice = () => {
    const [min, max] = priceSliderValue;
    setMinPrice(min);
    setMaxPrice(max);
    const updated = { ...initialFilters, minPrice: min, maxPrice: max };
    if (onFiltersChange) onFiltersChange(updated);
    handlePriceClose();
  };

  const handleSizeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSizeAnchor(e.currentTarget);
    const min = typeof minSize === 'number' ? minSize : 0;
    const max = typeof maxSize === 'number' ? maxSize : 10000;
    setSizeSliderValue([min, max]);
  };

  const handleSizeClose = () => setSizeAnchor(null);

  const applySize = () => {
    const [min, max] = sizeSliderValue;
    setMinSize(min);
    setMaxSize(max);
   
    const updated = { ...initialFilters, minSize: min, maxSize: max };
    if (onFiltersChange) onFiltersChange(updated);
    handleSizeClose();
  };

  const handleExport = () => {
    const filters: Filters = {
      minPrice: typeof minPrice === 'number' ? minPrice : null,
      maxPrice: typeof maxPrice === 'number' ? maxPrice : null,
      minSize: typeof minSize === 'number' ? minSize : null,
      maxSize: typeof maxSize === 'number' ? maxSize : null,
    };
    setPendingFilters(filters);
    setConfirmOpen(true);
  };

  const confirmExport = () => {
    if (!pendingFilters) return;
    try {
      // try {
      //   localStorage.setItem(FILTERS_KEY, JSON.stringify(pendingFilters));
      // } catch (e) {
      //   // ignore storage errors
      // }
      window.open('/export', '_blank');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to open export tab', e);
      // eslint-disable-next-line no-alert
      alert('Could not open export tab. See console for details.');
    } finally {
      setConfirmOpen(false);
      setPendingFilters(null);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f5fbfd',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
          <Button
            variant="outlined"
            onClick={handlePriceClick}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{ borderRadius: '999px', textTransform: 'none', backgroundColor: '#f0f4f4' }}
          >
            {formatLabel(typeof minPrice === 'number' ? minPrice : null, typeof maxPrice === 'number' ? maxPrice : null, 'price')}
          </Button>
          <Button
            variant="outlined"
            onClick={handleSizeClick}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{ borderRadius: '999px', textTransform: 'none', backgroundColor: '#f0f4f4' }}
          >
            {formatLabel(typeof minSize === 'number' ? minSize : null, typeof maxSize === 'number' ? maxSize : null, 'size')}

          </Button>
        </Box>

        <Button variant="contained" onClick={handleSave} sx={{ textTransform: 'none' }}>
          Save
        </Button>
        <Button variant="outlined" onClick={handleExport} sx={{ textTransform: 'none' }}>
          Export CSV
        </Button>
        <Button variant="outlined" onClick={handleReset} sx={{ textTransform: 'none' }}>
          Reset
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Export</DialogTitle>
        <DialogContent>
          <Typography>
            We'll open a new tab to export and download the CSV file. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmExport}>
            Export
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={Boolean(priceAnchor)}
        anchorEl={priceAnchor}
        onClose={handlePriceClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ padding: 2, width: 500, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Price
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: '100px',
                background: '#fff',
                padding: '0.6rem 1rem',
                borderRadius: 1,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.04) inset',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                {formatPriceValue(priceSliderValue[0])}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Slider
                value={priceSliderValue}
                onChange={(_, v) => setPriceSliderValue(v as number[])}
                valueLabelDisplay="off"
                min={0}
                max={10000000}
                step={50000}
              />
            </Box>
            <Box
              sx={{
                width: '150px',
                background: '#fff',
                padding: '0.6rem 1rem',
                borderRadius: 1,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.04) inset',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                {formatPriceValue(priceSliderValue[1])}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={handlePriceClose} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={applyPrice} sx={{ textTransform: 'none' }}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
      <Popover
        open={Boolean(sizeAnchor)}
        anchorEl={sizeAnchor}
        onClose={handleSizeClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ padding: 2, width: 420, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Size
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: '100px',
                background: '#fff',
                padding: '0.6rem 1rem',
                borderRadius: 1,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.04) inset',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                {sizeSliderValue[0].toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Slider
                value={sizeSliderValue}
                onChange={(_, v) => setSizeSliderValue(v as number[])}
                valueLabelDisplay="off"
                min={0}
                max={10000}
                step={10}
              />
            </Box>
            <Box
              sx={{
                width: '100px',
                background: '#fff',
                padding: '0.6rem 1rem',
                borderRadius: 1,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.04) inset',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                {sizeSliderValue[1] >= 10000 ? '10,000+' : `${sizeSliderValue[1].toLocaleString()}`}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={handleSizeClose} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={applySize} sx={{ textTransform: 'none' }}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default Toolbar;
