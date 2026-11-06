import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function Home() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home page versions
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" href="/client-side">
          Client-side rendered
        </Button>
        <Button variant="contained" href="/server-side">
          Server-side rendered
        </Button>
      </Stack>
    </Container>
  );
}
