import DynamicTracker from './DynamicTracker';

export default function UnitTracker({ units, completedTopics, toggleTopic, onUpdateUnits }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Units & Topics Tracker</h2>
        <p className="text-slate-500 text-sm">
          Check off topics as you complete them.
          <span className="text-slate-600"> Hover any title to rename it inline.</span>
        </p>
      </div>
      <DynamicTracker
        units={units}
        completedTopics={completedTopics}
        toggleTopic={toggleTopic}
        onUpdateUnits={onUpdateUnits}
        editable={true}
      />
    </div>
  );
}
