"use client";

import { BulkCreateHomeworkModal } from "./homework/bulk.create.homework.modal";
import { CreateHomeworkModal } from "./homework/create.homework.modal";
import { DeleteHomeworkModal } from "./homework/delete.homework.modal";
import { EditHomeworkModal } from "./homework/edit.homework.modal";
import { ViewHomeworkModal } from "./homework/view.homework.modal";
import { CreateSubjectModal } from "./subject/create.subject.modal";
import { EditSubjectModal } from "./subject/edit.subject.modal";

export function ModalRenderer() {
  return (
    <>
      <CreateHomeworkModal />
      <BulkCreateHomeworkModal />
      <EditHomeworkModal />
      <DeleteHomeworkModal />
      <ViewHomeworkModal />
      <CreateSubjectModal />
      <EditSubjectModal />
    </>
  );
}
