import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

export default function ProductSectionsSkeleton() {
  return (
    <>
      {[0, 1].map((section) => (
        <Box key={section} sx={{ mb: 5 }}>
          <Skeleton variant="text" width={240} sx={{ fontSize: "1.5rem" }} />
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map((card) => (
              <Grid key={card} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={220} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </>
  );
}
