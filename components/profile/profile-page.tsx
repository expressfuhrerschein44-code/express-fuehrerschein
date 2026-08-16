"use client";

/**
 * Express-Führerschein
 * Complete responsive Profile page.
 *
 * Important:
 * - receives already-resolved ProfileData;
 * - never imports Prisma;
 * - desktop/mobile use the same real data;
 * - dialogs are controlled here so state is not duplicated.
 */

import {
  useState,
} from "react";

import {
  ChangeEmailDialog,
} from "@/components/profile/account/change-email-dialog";

import {
  DeleteAccountDialog,
} from "@/components/profile/account/delete-account-dialog";

import {
  EditPersonalInformationDialog,
} from "@/components/profile/personal/edit-personal-information-dialog";

import {
  ProfileDesktop,
} from "@/components/profile/profile-desktop";

import {
  ProfileMobile,
} from "@/components/profile/profile-mobile";

import {
  ChangePasswordDialog,
} from "@/components/profile/security/change-password-dialog";

import {
  TwoFactorDialog,
} from "@/components/profile/security/two-factor-dialog";

import type {
  ProfileData,
} from "@/types/profile";

type ProfileDialog =
  | "edit"
  | "password"
  | "two-factor"
  | "email"
  | "delete"
  | null;

export interface ProfilePageProps {
  data:
    ProfileData;
}

export function ProfilePage({
  data,
}: ProfilePageProps) {
  const [
    dialog,
    setDialog,
  ] =
    useState<ProfileDialog>(
      null,
    );

  const close =
    () =>
      setDialog(
        null,
      );

  const sharedProps = {
    data,

    onEdit:
      () =>
        setDialog(
          "edit",
        ),

    onChangePassword:
      () =>
        setDialog(
          "password",
        ),

    onTwoFactor:
      () =>
        setDialog(
          "two-factor",
        ),

    onChangeEmail:
      () =>
        setDialog(
          "email",
        ),

    onDeleteAccount:
      () =>
        setDialog(
          "delete",
        ),
  };

  return (
    <>
      <ProfileDesktop
        {...sharedProps}
      />

      <ProfileMobile
        {...sharedProps}
      />

      <EditPersonalInformationDialog
        open={
          dialog ===
          "edit"
        }
        data={
          data
        }
        onClose={
          close
        }
      />

      <ChangePasswordDialog
        open={
          dialog ===
          "password"
        }
        onClose={
          close
        }
      />

      <TwoFactorDialog
        open={
          dialog ===
          "two-factor"
        }
        enabled={
          data
            .security
            .twoFactorEnabled
        }
        onClose={
          close
        }
      />

      <ChangeEmailDialog
        open={
          dialog ===
          "email"
        }
        currentEmail={
          data
            .identity
            .email
        }
        onClose={
          close
        }
      />

      <DeleteAccountDialog
        open={
          dialog ===
          "delete"
        }
        onClose={
          close
        }
      />
    </>
  );
}
