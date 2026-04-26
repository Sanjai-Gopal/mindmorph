"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useContentTransform } from "@/hooks/useContentTransform";
import { TransformInput } from "@/components/features/ContentMorpher/TransformInput";
import { TransformOutput } from "@/components/features/ContentMorpher/TransformOutput";
import { InterestManager } from "@/components/features/ContentMorpher/InterestManager";
import { SavedTransforms } from "@/components/features/ContentMorpher/SavedTransforms";

export default function TransformPage() {
  const vm = useContentTransform();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 xl:grid-cols-2"
        >
          <TransformInput
            input={vm.input}
            subject={vm.subject}
            subjects={vm.subjects}
            format={vm.format}
            loading={vm.loading}
            examples={vm.examples}
            onInputChange={vm.setInput}
            onSubjectChange={vm.setSubject}
            onFormatChange={vm.setFormat}
            onTransform={vm.transform}
            onUseExample={vm.setInput}
          />

          <TransformOutput
            output={vm.output}
            loading={vm.loading}
            format={vm.format}
            engagementPrediction={vm.engagementPrediction}
            related={vm.related}
            onCopy={vm.copyOutput}
            onStudyThis={vm.studyThis}
            onSave={vm.saveToLibrary}
            onRegenerate={vm.regenerate}
            onRate={vm.rateQuality}
            onLoadRelated={vm.loadSavedItem}
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 lg:grid-cols-[30%_70%]"
        >
          <InterestManager
            interests={vm.interests}
            interestInput={vm.interestInput}
            onInputChange={vm.setInterestInput}
            onAdd={vm.addInterest}
            onRemove={vm.removeInterest}
          />
          <SavedTransforms
            items={vm.saved}
            loading={vm.savedLoading}
            onOpen={vm.loadSavedItem}
            onDelete={vm.deleteSaved}
          />
        </motion.section>
      </div>
    </DashboardLayout>
  );
}
