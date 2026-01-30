import { useState } from 'react'
import { Button, Container, Typography, Box } from '@mui/material'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vite + React + TypeScript + MUI
        </Typography>
        <Button variant="contained" onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </Button>
        <Typography sx={{ mt: 2 }}>
          Edit <code>src/App.tsx</code> and save to test HMR
        </Typography>
      </Box>
    </Container>
  )
}

export default App
