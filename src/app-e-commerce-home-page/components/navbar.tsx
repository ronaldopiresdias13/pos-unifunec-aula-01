"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "next/link";

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ color: "inherit", textDecoration: "none", mr: 3 }}
        >
          FuneCommerce
        </Typography>
        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          <Button color="inherit">Categories</Button>
          <Button color="inherit">Deals</Button>
          <Button color="inherit">Cart</Button>
        </Box>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}
