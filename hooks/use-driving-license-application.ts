"use client";

/**
 * Express-Führerschein
 * Browser controller for the "Mein Führerschein" application page.
 */

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  DRIVING_LICENSE_APPLICATION_ROUTES,
  calculateApplicationPricing,
} from "@/data/driving-license-application";

import type {
  DrivingLicenseApplication,
  DrivingLicenseApplicationApiResponse,
  DrivingLicenseApplicationDocument,
  DrivingLicenseApplicationDocumentType,
  DrivingLicenseApplicationPageData,
  DrivingLicenseApplicationSignatureType,
  DrivingLicenseClassCode,
} from "@/types/driving-license-application";

export interface UseDrivingLicenseApplicationResult {
  application:
    DrivingLicenseApplication;

  selectedClasses:
    DrivingLicenseClassCode[];

  theoryPassed:
    boolean | null;

  practicalPassed:
    boolean | null;

  pricing:
    ReturnType<
      typeof calculateApplicationPricing
    >;

  saving:
    boolean;

  submitting:
    boolean;

  uploadBusy:
    boolean;

  error:
    string | null;

  setSelectedClasses:
    (
      classes:
        DrivingLicenseClassCode[],
    ) =>
      void;

  toggleClass:
    (
      code:
        DrivingLicenseClassCode,
    ) =>
      void;

  setTheoryPassed:
    (
      value:
        boolean,
    ) =>
      void;

  setPracticalPassed:
    (
      value:
        boolean,
    ) =>
      void;

  save:
    () =>
      Promise<boolean>;

  uploadDocument:
    (
      documentType:
        DrivingLicenseApplicationDocumentType,

      file:
        File,
    ) =>
      Promise<boolean>;

  deleteDocument:
    (
      documentType:
        DrivingLicenseApplicationDocumentType,
    ) =>
      Promise<boolean>;

  uploadSignature:
    (
      signatureType:
        DrivingLicenseApplicationSignatureType,

      file:
        File | Blob,

      filename?:
        string,
    ) =>
      Promise<boolean>;

  deleteSignature:
    () =>
      Promise<boolean>;

  submit:
    () =>
      Promise<DrivingLicenseApplication | null>;

  clearError:
    () =>
      void;
}

function messageFromPayload(
  payload:
    unknown,

  fallback:
    string,
): string {
  if (
    typeof payload ===
      "object" &&
    payload !==
      null &&
    "message" in payload &&
    typeof (
      payload as {
        message?:
          unknown;
      }
    ).message ===
      "string"
  ) {
    return (
      payload as {
        message:
          string;
      }
    ).message;
  }

  return fallback;
}

export function useDrivingLicenseApplication(
  initialData:
    DrivingLicenseApplicationPageData,
): UseDrivingLicenseApplicationResult {
  const [
    application,
    setApplication,
  ] =
    useState(
      initialData.application,
    );

  const [
    selectedClasses,
    setSelectedClasses,
  ] =
    useState<DrivingLicenseClassCode[]>(
      initialData
        .application
        .selectedClasses,
    );

  const [
    theoryPassed,
    setTheoryPassedState,
  ] =
    useState<boolean | null>(
      initialData
        .application
        .theoryPassed,
    );

  const [
    practicalPassed,
    setPracticalPassedState,
  ] =
    useState<boolean | null>(
      initialData
        .application
        .practicalPassed,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    uploadBusy,
    setUploadBusy,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const pricing =
    useMemo(
      () =>
        calculateApplicationPricing(
          selectedClasses,
        ),
      [
        selectedClasses,
      ],
    );

  const clearError =
    useCallback(
      () => {
        setError(
          null,
        );
      },
      [],
    );

  const toggleClass =
    useCallback(
      (
        code:
          DrivingLicenseClassCode,
      ) => {
        setSelectedClasses(
          (
            current,
          ) =>
            current.includes(
              code,
            )
              ? current.filter(
                  (
                    value,
                  ) =>
                    value !==
                    code,
                )
              : [
                  ...current,
                  code,
                ],
        );
      },
      [],
    );

  const setTheoryPassed =
    useCallback(
      (
        value:
          boolean,
      ) => {
        setTheoryPassedState(
          value,
        );
      },
      [],
    );

  const setPracticalPassed =
    useCallback(
      (
        value:
          boolean,
      ) => {
        setPracticalPassedState(
          value,
        );
      },
      [],
    );

  const save =
    useCallback(
      async () => {
        setSaving(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await fetch(
              DRIVING_LICENSE_APPLICATION_ROUTES
                .save,
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    selectedClasses,

                    theoryPassed,

                    practicalPassed,
                  }),
              },
            );

          const payload =
            await response
              .json()
              .catch(
                () =>
                  null,
              ) as
              DrivingLicenseApplicationApiResponse<{
                application:
                  DrivingLicenseApplication;
              }> | null;

          if (
            !response.ok ||
            !payload ||
            !payload.ok ||
            !payload.data
              ?.application
          ) {
            setError(
              messageFromPayload(
                payload,
                "Der Antrag konnte nicht gespeichert werden.",
              ),
            );

            return false;
          }

          setApplication(
            payload.data
              .application,
          );

          return true;
        } catch {
          setError(
            "Der Antrag konnte nicht gespeichert werden.",
          );

          return false;
        } finally {
          setSaving(
            false,
          );
        }
      },
      [
        practicalPassed,
        selectedClasses,
        theoryPassed,
      ],
    );

  const uploadDocument =
    useCallback(
      async (
        documentType:
          DrivingLicenseApplicationDocumentType,

        file:
          File,
      ) => {
        setUploadBusy(
          true,
        );

        setError(
          null,
        );

        try {
          const formData =
            new FormData();

          formData.append(
            "documentType",
            documentType,
          );

          formData.append(
            "file",
            file,
          );

          const response =
            await fetch(
              DRIVING_LICENSE_APPLICATION_ROUTES
                .document,
              {
                method:
                  "POST",

                body:
                  formData,
              },
            );

          const payload =
            await response
              .json()
              .catch(
                () =>
                  null,
              ) as
              DrivingLicenseApplicationApiResponse<{
                document:
                  DrivingLicenseApplicationDocument;
              }> | null;

          if (
            !response.ok ||
            !payload ||
            !payload.ok ||
            !payload.data
              ?.document
          ) {
            setError(
              messageFromPayload(
                payload,
                "Das Dokument konnte nicht hochgeladen werden.",
              ),
            );

            return false;
          }

          const uploaded =
            payload.data
              .document;

          setApplication(
            (
              current,
            ) => ({
              ...current,

              documents: [
                ...current.documents.filter(
                  (
                    document,
                  ) =>
                    document.documentType !==
                    uploaded.documentType,
                ),

                uploaded,
              ],
            }),
          );

          return true;
        } catch {
          setError(
            "Das Dokument konnte nicht hochgeladen werden.",
          );

          return false;
        } finally {
          setUploadBusy(
            false,
          );
        }
      },
      [],
    );

  const deleteDocument =
    useCallback(
      async (
        documentType:
          DrivingLicenseApplicationDocumentType,
      ) => {
        setUploadBusy(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await fetch(
              DRIVING_LICENSE_APPLICATION_ROUTES
                .document,
              {
                method:
                  "DELETE",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    documentType,
                  }),
              },
            );

          const payload =
            await response
              .json()
              .catch(
                () =>
                  null,
              );

          if (
            !response.ok
          ) {
            setError(
              messageFromPayload(
                payload,
                "Das Dokument konnte nicht entfernt werden.",
              ),
            );

            return false;
          }

          setApplication(
            (
              current,
            ) => ({
              ...current,

              documents:
                current.documents.filter(
                  (
                    document,
                  ) =>
                    document.documentType !==
                    documentType,
                ),
            }),
          );

          return true;
        } catch {
          setError(
            "Das Dokument konnte nicht entfernt werden.",
          );

          return false;
        } finally {
          setUploadBusy(
            false,
          );
        }
      },
      [],
    );

  const uploadSignature =
    useCallback(
      async (
        signatureType:
          DrivingLicenseApplicationSignatureType,

        file:
          File | Blob,

        filename =
          signatureType ===
            "drawn"
            ? "signature.png"
            : "signature",
      ) => {
        setUploadBusy(
          true,
        );

        setError(
          null,
        );

        try {
          const formData =
            new FormData();

          formData.append(
            "signatureType",
            signatureType,
          );

          formData.append(
            "file",
            file,
            filename,
          );

          const response =
            await fetch(
              DRIVING_LICENSE_APPLICATION_ROUTES
                .signature,
              {
                method:
                  "POST",

                body:
                  formData,
              },
            );

          const payload =
            await response
              .json()
              .catch(
                () =>
                  null,
              ) as
              DrivingLicenseApplicationApiResponse<{
                signatureType:
                  DrivingLicenseApplicationSignatureType;

                signaturePath:
                  string;
              }> | null;

          if (
            !response.ok ||
            !payload ||
            !payload.ok ||
            !payload.data
          ) {
            setError(
              messageFromPayload(
                payload,
                "Die Unterschrift konnte nicht gespeichert werden.",
              ),
            );

            return false;
          }

          const result =
            payload.data;

          setApplication(
            (
              current,
            ) => ({
              ...current,

              signatureType:
                result
                  .signatureType,

              signaturePath:
                result
                  .signaturePath,
            }),
          );

          return true;
        } catch {
          setError(
            "Die Unterschrift konnte nicht gespeichert werden.",
          );

          return false;
        } finally {
          setUploadBusy(
            false,
          );
        }
      },
      [],
    );

  const deleteSignature =
    useCallback(
      async () => {
        setUploadBusy(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await fetch(
              DRIVING_LICENSE_APPLICATION_ROUTES
                .signature,
              {
                method:
                  "DELETE",
              },
            );

          const payload =
            await response
              .json()
              .catch(
                () =>
                  null,
              );

          if (
            !response.ok
          ) {
            setError(
              messageFromPayload(
                payload,
                "Die Unterschrift konnte nicht entfernt werden.",
              ),
            );

            return false;
          }

          setApplication(
            (
              current,
            ) => ({
              ...current,

              signatureType:
                null,

              signaturePath:
                null,
            }),
          );

          return true;
        } catch {
          setError(
            "Die Unterschrift konnte nicht entfernt werden.",
          );

          return false;
        } finally {
          setUploadBusy(
            false,
          );
        }
      },
      [],
    );

  const submit =
    useCallback(
      async () => {
        setSubmitting(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await fetch(
              DRIVING_LICENSE_APPLICATION_ROUTES
                .submit,
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    selectedClasses,

                    theoryPassed,

                    practicalPassed,
                  }),
              },
            );

          const payload =
            await response
              .json()
              .catch(
                () =>
                  null,
              ) as
              DrivingLicenseApplicationApiResponse<{
                application:
                  DrivingLicenseApplication;
              }> | null;

          if (
            !response.ok ||
            !payload ||
            !payload.ok ||
            !payload.data
              ?.application
          ) {
            setError(
              messageFromPayload(
                payload,
                "Der Antrag konnte nicht übermittelt werden.",
              ),
            );

            return null;
          }

          const submitted =
            payload.data
              .application;

          setApplication(
            submitted,
          );

          return submitted;
        } catch {
          setError(
            "Der Antrag konnte nicht übermittelt werden.",
          );

          return null;
        } finally {
          setSubmitting(
            false,
          );
        }
      },
      [
        practicalPassed,
        selectedClasses,
        theoryPassed,
      ],
    );

  return {
    application,

    selectedClasses,

    theoryPassed,

    practicalPassed,

    pricing,

    saving,

    submitting,

    uploadBusy,

    error,

    setSelectedClasses,

    toggleClass,

    setTheoryPassed,

    setPracticalPassed,

    save,

    uploadDocument,

    deleteDocument,

    uploadSignature,

    deleteSignature,

    submit,

    clearError,
  };
}
