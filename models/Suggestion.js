// /models/Suggestion.js
import mongoose from 'mongoose';

const SuggestionSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
  },
  highlights: {
    type: [String],
    required: true,
  },
  bestTimeToVisit: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Suggestion ||
  mongoose.model('Suggestion', SuggestionSchema);