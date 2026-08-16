import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  DocumentStorageLocator,
} from "@/types/documents";

export interface UserDocumentRepositoryRecord {
  id: string;
  documentType: string;
  title: string | null;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  status: string;
  rejectionReason: string | null;
  expiresOn: Date | null;
  uploadedAt: Date;
}

export interface ApplicationDocumentRepositoryRecord {
  id: string;
  documentType: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  submittedAt: Date | null;
  createdAt: Date;
}

export interface DocumentsRepositorySnapshot {
  activeLicenseClassCode: string | null;

  userDocuments:
    UserDocumentRepositoryRecord[];

  applicationDocuments:
    ApplicationDocumentRepositoryRecord[];
}

function safeNumber(
  value:
    bigint,
): number {
  const converted =
    Number(
      value,
    );

  return Number.isFinite(
    converted,
  )
    ? Math.max(
        0,
        converted,
      )
    : 0;
}

function normalizeDocumentType(
  value:
    string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function applicationDocumentOrder(
  documentType:
    string,
): number {
  switch (
    normalizeDocumentType(
      documentType,
    )
  ) {
    case "id_front":
      return 1;

    case "id_back":
      return 2;

    case "portrait_photo":
      return 3;

    default:
      return 100;
  }
}

/**
 * Garde uniquement la version la plus récente
 * de chaque type de document pour une demande.
 *
 * Exemple :
 *
 * id_front #ancien
 * id_front #nouveau
 *
 * => seul #nouveau est retourné.
 */
function keepLatestApplicationDocumentPerType<
  T extends {
    document_type:
      string;

    created_at:
      Date;
  },
>(
  documents:
    readonly T[],
): T[] {
  const latestByType =
    new Map<
      string,
      T
    >();

  const sorted =
    [
      ...documents,
    ].sort(
      (
        left,
        right,
      ) =>
        right.created_at.getTime() -
        left.created_at.getTime(),
    );

  for (
    const document of
    sorted
  ) {
    const key =
      normalizeDocumentType(
        document.document_type,
      );

    if (
      latestByType.has(
        key,
      )
    ) {
      continue;
    }

    latestByType.set(
      key,
      document,
    );
  }

  return Array.from(
    latestByType.values(),
  ).sort(
    (
      left,
      right,
    ) => {
      const orderDifference =
        applicationDocumentOrder(
          left.document_type,
        ) -
        applicationDocumentOrder(
          right.document_type,
        );

      if (
        orderDifference !==
        0
      ) {
        return orderDifference;
      }

      return (
        right.created_at.getTime() -
        left.created_at.getTime()
      );
    },
  );
}

export async function getDocumentsRepositorySnapshot(
  input: {
    userId:
      string;
  },
): Promise<DocumentsRepositorySnapshot> {
  /*
   * On récupère séparément :
   *
   * 1. utilisateur + classe active
   * 2. documents généraux user_documents
   * 3. demande de permis la plus récente
   *
   * Les application_documents seront ensuite récupérés
   * uniquement pour cette demande.
   */
  const [
    user,
    userDocuments,
    latestApplication,
  ] =
    await Promise.all([
      prisma.users.findUnique({
        where: {
          id:
            input.userId,
        },

        select: {
          id:
            true,

          user_license_classes: {
            where: {
              status:
                "active",
            },

            orderBy: [
              {
                is_primary:
                  "desc",
              },
              {
                started_at:
                  "asc",
              },
            ],

            take:
              1,

            select: {
              license_class_code:
                true,
            },
          },
        },
      }),

      prisma.user_documents.findMany({
        where: {
          user_id:
            input.userId,

          deleted_at:
            null,
        },

        select: {
          id:
            true,

          document_type:
            true,

          title:
            true,

          original_filename:
            true,

          mime_type:
            true,

          file_size_bytes:
            true,

          status:
            true,

          rejection_reason:
            true,

          expires_on:
            true,

          uploaded_at:
            true,
        },

        orderBy: [
          {
            uploaded_at:
              "desc",
          },
          {
            created_at:
              "desc",
          },
        ],
      }),

      /*
       * IMPORTANT :
       *
       * On récupère seulement la demande la plus récente
       * de cet utilisateur.
       *
       * Les anciennes demandes restent en base,
       * mais leurs documents ne sont plus affichés
       * dans la section actuelle de /dokumente.
       */
      prisma.driving_license_applications.findFirst({
        where: {
          user_id:
            input.userId,
        },

        orderBy: {
          created_at:
            "desc",
        },

        select: {
          id:
            true,

          submitted_at:
            true,
        },
      }),
    ]);

  if (!user) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  /*
   * Aucun dossier de permis :
   * aucun application_document à afficher.
   */
  const rawApplicationDocuments =
    latestApplication
      ? await prisma.application_documents.findMany({
          where: {
            user_id:
              input.userId,

            application_id:
              latestApplication.id,
          },

          select: {
            id:
              true,

            document_type:
              true,

            original_filename:
              true,

            mime_type:
              true,

            file_size_bytes:
              true,

            created_at:
              true,
          },

          /*
           * Le plus récent en premier est important :
           * si le client a remplacé un document,
           * on conservera ensuite la dernière version.
           */
          orderBy: {
            created_at:
              "desc",
          },
        })
      : [];

  /*
   * Protection supplémentaire :
   *
   * même si plusieurs lignes du même document_type
   * existent dans la demande actuelle,
   * /dokumente n'en affiche qu'une :
   * la plus récente.
   */
  const currentApplicationDocuments =
    keepLatestApplicationDocumentPerType(
      rawApplicationDocuments,
    );

  return {
    activeLicenseClassCode:
      user.user_license_classes[0]
        ?.license_class_code ??
      null,

    userDocuments:
      userDocuments.map(
        (
          document,
        ) => ({
          id:
            document.id,

          documentType:
            document.document_type,

          title:
            document.title,

          originalFilename:
            document.original_filename,

          mimeType:
            document.mime_type,

          fileSizeBytes:
            safeNumber(
              document.file_size_bytes,
            ),

          status:
            document.status,

          rejectionReason:
            document.rejection_reason,

          expiresOn:
            document.expires_on,

          uploadedAt:
            document.uploaded_at,
        }),
      ),

    applicationDocuments:
      currentApplicationDocuments.map(
        (
          document,
        ) => ({
          id:
            document.id,

          documentType:
            document.document_type,

          originalFilename:
            document.original_filename,

          mimeType:
            document.mime_type,

          fileSizeBytes:
            safeNumber(
              document.file_size_bytes,
            ),

          /*
           * Tous les documents ici appartiennent
           * à la même demande actuelle.
           */
          submittedAt:
            latestApplication
              ?.submitted_at ??
            null,

          createdAt:
            document.created_at,
        }),
      ),
  };
}

export async function findDocumentStorageLocatorForUser(
  input: {
    userId:
      string;

    documentId:
      string;
  },
): Promise<DocumentStorageLocator | null> {
  /*
   * 1. Recherche dans user_documents.
   *
   * On vérifie systématiquement user_id.
   * Le client ne peut donc pas ouvrir
   * le document d'un autre utilisateur.
   */
  const userDocument =
    await prisma.user_documents.findFirst({
      where: {
        id:
          input.documentId,

        user_id:
          input.userId,

        deleted_at:
          null,
      },

      select: {
        id:
          true,

        storage_bucket:
          true,

        storage_path:
          true,

        original_filename:
          true,

        mime_type:
          true,
      },
    });

  if (
    userDocument
  ) {
    return {
      documentId:
        userDocument.id,

      source:
        "user",

      storageBucket:
        userDocument.storage_bucket,

      storagePath:
        userDocument.storage_path,

      originalFilename:
        userDocument.original_filename,

      mimeType:
        userDocument.mime_type,
    };
  }

  /*
   * 2. Recherche dans application_documents.
   *
   * Là encore user_id est obligatoire.
   *
   * On laisse volontairement cette fonction capable
   * d'ouvrir un ancien document appartenant réellement
   * au client si son ID est déjà connu.
   *
   * Cela évite de casser d'anciens liens légitimes.
   *
   * C'est uniquement la PAGE /dokumente qui filtre
   * l'affichage sur la demande actuelle.
   */
  const applicationDocument =
    await prisma.application_documents.findFirst({
      where: {
        id:
          input.documentId,

        user_id:
          input.userId,
      },

      select: {
        id:
          true,

        storage_bucket:
          true,

        storage_path:
          true,

        original_filename:
          true,

        mime_type:
          true,
      },
    });

  if (
    !applicationDocument
  ) {
    return null;
  }

  return {
    documentId:
      applicationDocument.id,

    source:
      "application",

    storageBucket:
      applicationDocument.storage_bucket,

    storagePath:
      applicationDocument.storage_path,

    originalFilename:
      applicationDocument.original_filename,

    mimeType:
      applicationDocument.mime_type,
  };
}