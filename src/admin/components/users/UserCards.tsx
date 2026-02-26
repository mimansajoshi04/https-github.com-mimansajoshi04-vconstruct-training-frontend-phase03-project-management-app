//  Libraries
import { memo, type ReactNode } from "react";

// MUI Components
import {
  Avatar,
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

// Database Functions
import { getInitials } from "../../../../database/createAvatar";

import { type UserType } from "../../../../database/model/user";

import { useAuthCheck } from "../../../hooks";

interface UserCardsProps {
  users: UserType[] | undefined;
}

const UserCards = memo(function UserCardsComponent({
  users,
}: UserCardsProps): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  if (!users || users.length === 0) {
    return <h3>No users found.</h3>;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr", // mobile: 1 column
          sm: "repeat(2, 1fr)", // small screens: 2 columns
          md: "repeat(3, 1fr)", // medium screens: 3 columns
          lg: "repeat(4, 1fr)", // large screens: 4 columns
        },
        gap: 2, // spacing between cards
        width: "100%",
        margin: "2rem",
      }}
    >
      {users.map((user: UserType) => {
        return (
          <Card
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            key={user.id}
            id={String(user.id)}
          >
            <CardContent>
              <Stack
                direction="row-reverse"
                spacing={2}
                sx={{ marginBottom: "1rem", justifyContent: "space-between" }}
              >
                <Avatar
                  alt={user.name}
                  sx={{ backgroundColor: user.avatar_color }}
                >
                  {getInitials(user.name)}
                </Avatar>
                <Typography gutterBottom variant="h6" component="div">
                  {user.name}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Role: {user.role}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Email: <em>{user.email}</em>
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
});

export default UserCards;
