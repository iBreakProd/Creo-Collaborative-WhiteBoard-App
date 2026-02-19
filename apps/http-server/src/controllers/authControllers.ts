import { Request, Response } from "express";
import { db, usersTable } from "@workspace/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserSigninSchema, UserSignupSchema } from "@workspace/common";
import { eq } from "drizzle-orm";

export async function signupController(req: Request, res: Response) {
  const inputValidator = UserSignupSchema;
  const validatedInput = inputValidator.safeParse(req.body);

  if (validatedInput.error) {
    res.status(404).json({
      message: "Invalid Inputs",
    });
    return;
  }

  try {
    const saltrounds = parseInt(process.env.SALTROUNDS || "10");
    const hashedPwd = await bcrypt.hash(
      validatedInput.data.password,
      saltrounds
    );
    const userCreated = await db.insert(usersTable).values({
        username: validatedInput.data.username,
        password: hashedPwd,
        name: validatedInput.data.name,
    }).returning();
    
    const user = {
      id: userCreated[0]?.id,
      username: userCreated[0]?.username,
      name: userCreated[0]?.name,
      photo: userCreated[0]?.photo,
    };
    const token = jwt.sign(
      user,
      process.env.JWT_SECRET || "kjhytfrde45678iuytrfdcfgy6tr"
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "User Signed Up",
      user,
      token,
    });
    return;
  } catch (e) {
    console.log(e);
    const code = (e as unknown as { code?: string }).code;
    if (code === "23505") { // Postgres unique constraint violation code
      res.status(401).json({
        message: "Username already exists",
      });
    }
    res.status(401).json({
      message: "Error faced while creating user, try again",
    });
  }
}

export async function signinController(req: Request, res: Response) {
  const inputValidator = UserSigninSchema;

  const validatedInput = inputValidator.safeParse(req.body);

  if (validatedInput.error) {
    res.status(404).json({
      message: "Invalid Inputs",
    });
    return;
  }

  try {
    const userResult = await db.select().from(usersTable).where(eq(usersTable.username, validatedInput.data.username));
    const userFound = userResult[0];

    if (!userFound) {
      res.status(404).json({
        message: "The username does not exist",
      });
      return;
    }
    const validatedPassword = await bcrypt.compare(
      validatedInput.data.password,
      userFound.password
    );
    if (!validatedPassword) {
      res.status(404).json({
        message: "The password is incorrect",
      });
      return;
    }
    const user = {
      id: userFound.id,
      username: userFound.username,
      name: userFound.name,
      photo: userFound.photo,
    };
    const token = jwt.sign(
      user,
      process.env.JWT_SECRET || "kjhytfrde45678iuytrfdcfgy6tr"
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "User Signed In",
      user: user,
      token,
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Error faced while loging user in, try again",
    });
  }
}

export async function signoutController(req: Request, res: Response) {
  res.clearCookie("jwt");
  res.json({
    message: "User logged out",
  });
}

export async function infoController(req: Request, res: Response) {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }

  try {
    const userResult = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const userFound = userResult[0];

    const user = {
      id: userFound?.id,
      username: userFound?.username,
      name: userFound?.name,
    };

    res.status(200).json({
      message: "User info",
      user,
    });
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Error faced while getting user info, try again",
    });
  }
}
