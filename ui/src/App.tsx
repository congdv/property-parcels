import { CssBaseline } from '@mui/material';
import Header from './components/Header';
import './App.css';
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import PropertyPanel from './components/PropertyPanel';
import MapComponent from './components/ParcelMap';

const parcels = [
  {
    sl_uuid: '7e2af1ed-ed5f-565d-9363-d279749f4c05',
    address: '4536 EDMONDSON AVE',
    county: 'dallas',
    sqft: null,
    total_value: '520',
    geometry: {
      type: 'GeometryCollection',
      geometries: [
        { type: "Point", coordinates: [-96.814593, 32.834256] },
        {
          type: "Polygon",
          coordinates: [
            [
              [-96.814591885, 32.834434481],
              [-96.814484596, 32.834425466],
              [-96.814506054, 32.834055858],
              [-96.81453824, 32.834064873],
              [-96.814699173, 32.834073888],
              [-96.814699173, 32.834434481],
              [-96.814591885, 32.834434481],
            ],
          ],
        },
      ],
    },
  },
  {
    sl_uuid: '31233bbe-833f-558c-8ccd-bd5ba306d77e',
    address: '1609 L AVE',
    county: 'collin',
    sqft: 2279,
    total_value: '101366',
    geometry: {
      type: 'GeometryCollection',
      geometries: [
        { type: "Point", coordinates: [-96.697763, 33.022363] },
        {
          type: "Polygon",
          coordinates: [
            [
              [-96.697593927, 33.022454933],
              [-96.697593927, 33.022266023],
              [-96.697980165, 33.022266023],
              [-96.697980165, 33.022445937],
              [-96.697593927, 33.022454933],
            ],
          ],
        },
      ],
    },
  },
  {
    sl_uuid: 'ed44329f-8f03-535d-ad11-d810200b66b4',
    address: '2229 CROSS BEND RD',
    county: 'collin',
    sqft: 2838,
    total_value: '418667',
    geometry: {
      type: 'GeometryCollection',
      geometries: [
        { type: "Point", coordinates: [-96.737231, 33.049215] },
        {
          type: "Polygon",
          coordinates: [
            [
              [-96.737312078, 33.049428813],
              [-96.737054586, 33.049401834],
              [-96.737086773, 33.049078089],
              [-96.737344265, 33.049096075],
              [-96.737312078, 33.049428813],
            ],
          ],
        },
      ],
    },
  },
  {
    sl_uuid: 'c8178284-1a2d-5336-ae4a-b84614e9b98c',
    address: '4100 ANDYS LN',
    county: 'collin',
    sqft: 932,
    total_value: '23976',
    geometry: {
      type: 'GeometryCollection',
      geometries: [
        { type: "Point", coordinates: [-96.60866, 33.057319] },
        {
          type: "Polygon",
          coordinates: [
            [
              [-96.608104706, 33.059167601],
              [-96.608190536, 33.055489829],
              [-96.609209776, 33.055507813],
              [-96.609199047, 33.055561767],
              [-96.609145403, 33.057315246],
              [-96.609091759, 33.059113649],
              [-96.609123945, 33.059113649],
              [-96.609123945, 33.059167601],
              [-96.608104706, 33.059167601],
            ],
          ],
        },
      ],
    },
  },
  {
    sl_uuid: '6d2102f0-e788-526a-a299-adcd3d80d942',
    address: '2233 CROSS BEND RD',
    county: 'collin',
    sqft: 3118,
    total_value: '440534',
    geometry: {
      type: 'GeometryCollection',
      geometries: [
        { type: "Point", coordinates: [-96.737462, 33.049274] },
        {
          type: "Polygon",
          coordinates: [
            [
              [-96.737558842, 33.049437806],
              [-96.737344265, 33.049428813],
              [-96.737312078, 33.049428813],
              [-96.737344265, 33.049096075],
              [-96.737591028, 33.04911406],
              [-96.737558842, 33.049437806],
            ],
          ],
        },
      ],
    },
  },
];


function App() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated && window.location.search.includes('code=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, [auth.isAuthenticated]);

  return (
    <div className="app-root">
      <CssBaseline />
      <Header />
      <div className="map-container">
        <PropertyPanel/>
      </div>
    </div>
  );
}

export default App;
