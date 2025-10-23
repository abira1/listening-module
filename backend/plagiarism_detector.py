"""
Plagiarism Detector - Detect plagiarism in student submissions
"""

import logging
from typing import List, Dict, Tuple, Any
from difflib import SequenceMatcher
import re

logger = logging.getLogger(__name__)


class PlagiarismDetector:
    """Detect plagiarism in student submissions"""
    
    def __init__(self, similarity_threshold: float = 0.75):
        """
        Initialize plagiarism detector
        
        Args:
            similarity_threshold: Threshold for flagging as plagiarism (0-1)
        """
        self.similarity_threshold = similarity_threshold
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalize text for comparison
        
        Args:
            text: Text to normalize
        
        Returns:
            Normalized text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove punctuation
        text = re.sub(r'[^\w\s]', '', text)
        
        return text
    
    @staticmethod
    def calculate_similarity(text1: str, text2: str) -> float:
        """
        Calculate similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
        
        Returns:
            Similarity score (0-1)
        """
        # Normalize texts
        norm_text1 = PlagiarismDetector.normalize_text(text1)
        norm_text2 = PlagiarismDetector.normalize_text(text2)
        
        # Calculate similarity using SequenceMatcher
        matcher = SequenceMatcher(None, norm_text1, norm_text2)
        similarity = matcher.ratio()
        
        return similarity
    
    @staticmethod
    def extract_ngrams(text: str, n: int = 3) -> List[str]:
        """
        Extract n-grams from text
        
        Args:
            text: Text to extract from
            n: Size of n-grams
        
        Returns:
            List of n-grams
        """
        words = text.lower().split()
        ngrams = []
        
        for i in range(len(words) - n + 1):
            ngram = ' '.join(words[i:i+n])
            ngrams.append(ngram)
        
        return ngrams
    
    @staticmethod
    def find_matching_ngrams(
        text1: str,
        text2: str,
        n: int = 3
    ) -> List[str]:
        """
        Find matching n-grams between two texts
        
        Args:
            text1: First text
            text2: Second text
            n: Size of n-grams
        
        Returns:
            List of matching n-grams
        """
        ngrams1 = set(PlagiarismDetector.extract_ngrams(text1, n))
        ngrams2 = set(PlagiarismDetector.extract_ngrams(text2, n))
        
        matching = list(ngrams1.intersection(ngrams2))
        return matching
    
    def check_plagiarism(
        self,
        submission_text: str,
        reference_texts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Check submission against reference texts
        
        Args:
            submission_text: Student submission text
            reference_texts: List of reference texts with metadata
        
        Returns:
            Plagiarism check result
        """
        results = {
            'is_plagiarized': False,
            'overall_similarity': 0.0,
            'matches': [],
            'risk_level': 'low'
        }
        
        if not submission_text or not reference_texts:
            return results
        
        max_similarity = 0.0
        
        for reference in reference_texts:
            ref_text = reference.get('text', '')
            ref_id = reference.get('id', 'unknown')
            ref_source = reference.get('source', 'unknown')
            
            # Calculate similarity
            similarity = self.calculate_similarity(submission_text, ref_text)
            
            # Find matching n-grams
            matching_ngrams = self.find_matching_ngrams(submission_text, ref_text, n=3)
            
            if similarity > max_similarity:
                max_similarity = similarity
            
            # Add to matches if significant
            if similarity > 0.5 or len(matching_ngrams) > 5:
                results['matches'].append({
                    'source': ref_source,
                    'reference_id': ref_id,
                    'similarity': round(similarity, 3),
                    'matching_phrases': matching_ngrams[:5],  # Top 5 matches
                    'match_count': len(matching_ngrams)
                })
        
        # Sort matches by similarity
        results['matches'].sort(key=lambda x: x['similarity'], reverse=True)
        
        # Determine if plagiarized
        results['overall_similarity'] = round(max_similarity, 3)
        results['is_plagiarized'] = max_similarity >= self.similarity_threshold
        
        # Determine risk level
        if max_similarity >= 0.9:
            results['risk_level'] = 'critical'
        elif max_similarity >= 0.75:
            results['risk_level'] = 'high'
        elif max_similarity >= 0.6:
            results['risk_level'] = 'medium'
        else:
            results['risk_level'] = 'low'
        
        logger.info(f"Plagiarism check completed: {results['risk_level']} risk")
        return results
    
    def check_internal_plagiarism(
        self,
        submissions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Check for plagiarism between submissions
        
        Args:
            submissions: List of submissions with text
        
        Returns:
            List of plagiarism pairs
        """
        plagiarism_pairs = []
        
        for i in range(len(submissions)):
            for j in range(i + 1, len(submissions)):
                sub1 = submissions[i]
                sub2 = submissions[j]
                
                text1 = sub1.get('text', '')
                text2 = sub2.get('text', '')
                
                if not text1 or not text2:
                    continue
                
                similarity = self.calculate_similarity(text1, text2)
                
                if similarity >= self.similarity_threshold:
                    plagiarism_pairs.append({
                        'submission_1_id': sub1.get('id'),
                        'submission_1_student': sub1.get('student_name'),
                        'submission_2_id': sub2.get('id'),
                        'submission_2_student': sub2.get('student_name'),
                        'similarity': round(similarity, 3),
                        'risk_level': self._get_risk_level(similarity)
                    })
        
        return sorted(plagiarism_pairs, key=lambda x: x['similarity'], reverse=True)
    
    def _get_risk_level(self, similarity: float) -> str:
        """Get risk level based on similarity"""
        if similarity >= 0.9:
            return 'critical'
        elif similarity >= 0.75:
            return 'high'
        elif similarity >= 0.6:
            return 'medium'
        return 'low'
    
    def generate_report(
        self,
        submission_id: str,
        plagiarism_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate plagiarism report
        
        Args:
            submission_id: Submission ID
            plagiarism_result: Plagiarism check result
        
        Returns:
            Plagiarism report
        """
        report = {
            'submission_id': submission_id,
            'is_plagiarized': plagiarism_result['is_plagiarized'],
            'overall_similarity': plagiarism_result['overall_similarity'],
            'risk_level': plagiarism_result['risk_level'],
            'matches': plagiarism_result['matches'],
            'recommendation': self._get_recommendation(plagiarism_result),
            'action_required': plagiarism_result['risk_level'] in ['high', 'critical']
        }
        
        return report
    
    @staticmethod
    def _get_recommendation(result: Dict[str, Any]) -> str:
        """Get recommendation based on plagiarism result"""
        risk_level = result['risk_level']
        
        if risk_level == 'critical':
            return 'CRITICAL: Likely plagiarism detected. Immediate review required.'
        elif risk_level == 'high':
            return 'HIGH: Significant similarity detected. Manual review recommended.'
        elif risk_level == 'medium':
            return 'MEDIUM: Some similarity detected. Consider reviewing.'
        else:
            return 'LOW: No significant plagiarism detected.'

