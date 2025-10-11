#!/usr/bin/env python3
"""
Initialize IELTS Reading Practice Test 1 on application startup
This ensures the reading test is always available in the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Fixed exam ID for IELTS Reading Practice Test 1
READING_EXAM_ID = "ielts-reading-practice-test-1"

def generate_id():
    return str(uuid.uuid4())

def get_timestamp():
    return datetime.now(timezone.utc).isoformat()

# Reading passages content
PASSAGE_1 = """The Mozart Effect

A. Can Mozart's music make you smarter? A psychologist, Frances Rauscher, and colleagues discovered that listening to Mozart can improve people's mathematic and spatial reasoning abilities. In a study, college students who listened to a Mozart sonata for ten minutes before taking an IQ test scored nine points higher than those who did not listen to the music. This phenomenon is called the "Mozart Effect."

B. Rauscher's discovery took its root from Gordon Shaw's computer model of the brain, which is formed from the concept that creativity results from the complex firing patterns of the brain's nerve cells. Shaw found that by reproducing random wave patterns, he could predict how certain nerve cells were activated. Further, by using musical patterns in his model, he seemed to be able to improve the brain activity. This led Rauscher to test the model on humans when Shaw believed that the Mozart sonata K. 448 employed the type of musical structure that would enhance spatial-temporal reasoning. In 1993, Rauscher conducted the experiment which demonstrated that college students who listened to the Mozart sonata had improved spatial abilities.

C. This finding led to widespread media attention and many applications. Music experts began to take note. Scientists took the finding seriously and began investigating and experimenting further to test the Mozart Effect more thoroughly. Some researchers found similar effects with music from other composers. In fact, many musical pieces can trigger such effects. Nevertheless, none had such a persistent and significant effect as Mozart.

D. Some scientists are still skeptical about the evidence of the Mozart Effect. They argue that listening to Mozart's music doesn't directly affect the way humans think or act. Rather, they say, people already have a natural tendency to enjoy Mozart's music, and by listening to the music that people enjoy, they become happier and more creative. Thus, while listening to Mozart's music might trigger enhanced brain activity, it does not necessarily represent a direct improvement in brain function.

E. However, such doubts could not prevent people from applying the Mozart Effect in real situations. In the United States, the governors of Georgia and Tennessee proposed that the state provide free music CDs to every newborn child. In Florida, a law was passed requiring that Mozart's music be played in day-care centers. Clearly, the research on the Mozart Effect has captured the public's attention.

F. Today, scientists are researching to see how music affects the brain, especially at a young age. They are trying to determine exactly how music enhances learning and intelligence. Studies are being done to examine how children who study music compare with those who do not. It has been shown that formal musical training in childhood has profound effects on the developing brain.

G. When Rauscher published her findings in 1993, the media immediately took notice. The first was the Los Angeles Times. Within a few days, the story had spread through the Associated Press, and soon after that, the Mozart Effect could be heard about around the world. In the weeks that followed, Mozart CD sales doubled.

H. Since the initial experiments, criticism has come from many corners. Some scientists have not been able to replicate the original findings. Some researchers claim that other types of stimulation, such as listening to a story, may also improve test performance. Other research suggests that the effect is very short-lived, lasting only 10 to 15 minutes. Michael Linton, a researcher from Shippensburg University of Pennsylvania, found that the effect does not work for rats. Despite the controversy, the Mozart Effect remains widely accepted by the general public."""

PASSAGE_2 = """Fears

A. Everyone experiences fear – it's a normal and useful response to potential danger. But anxiety disorders – including generalized anxiety, social phobia, obsessive-compulsive disorder, and panic attacks – leave people debilitated by fear. Understanding the brain processes that cause anxiety in people, and how genetic variation might influence social behavior, is therefore of great interest to neuroscientists.

B. The difficulty researchers face is that while anxious people describe feelings that are qualitatively similar to simple fear, such as worry and unease, they do so in the absence of an identifiable threat. This presents a problem when trying to study such anxiety in animal models, since the animals can't tell us whether they're feeling worry and unease. But if we can't model human anxiety in animals, how can we ever work out what's causing it, or develop new treatments for it?

C. One approach is to focus on those aspects of fear and anxiety that we can compare across species. For example, human beings and monkeys both have similar physiological and psychological responses to fear-inducing situations. These include defensive aggression, being startled easily, heart palpitations, and high blood pressure. All these are part of the 'fight or flight' response, and they differ from humans and animals only in the time span over which they are experienced. The essential point is that most scientists believe it is the degree, duration, and context of the response rather than the quality of the emotion itself that distinguishes an anxiety disorder from a normal fear response.

D. This view has led to a focus on genetic differences between individuals. Recently, scientists have begun to successfully correlate human behavior with specific genetic variations. One well-studied example is the serotonin transporter gene (5-HTT). In humans, this gene comes in a 'short' version and a 'long' version; the long version produces more of the transporter protein. In people, individuals with one or two copies of the short gene are at greater risk for depression and suicide attempts.

E. Fear, then, is not a simple emotion. Indeed, the word 'fear' probably encompasses a wide range of states, from the terror a gazelle feels when fleeing a lion, through the dread of a soldier going into combat, to the apprehension many people feel when preparing for a job interview. Neuroscientists attempting to study fear in the laboratory must be very careful to specify exactly what they mean by the term.

F. All social animals communicate emotional information to each other through their faces and their eyes in particular – which is why a single glance can make the difference between a fight and a friendly meeting. For monkeys, the face of a high-status male is a potent stimulus: meet his gaze, and you will see strong behavioral effects. Junior male monkeys typically react with a combination of defensive aggression and submission – looking away while at the same time making threatening gestures.

G. When researchers analyzed the findings they found that there was a striking difference in behavior related to the short/long gene variations. Monkeys with at least one copy of the short gene were much less likely to look at the face of a high-status male, and as a result, they were less likely to get into fights. Another study used food as a reward in order to train monkeys to look at threatening faces. Animals with one copy of the short gene were less likely to learn to look at the threatening faces in order to get a reward. The monkeys with two long genes (the L/L monkeys) were willing to look at the high-status males for a reward.

H. Importantly, this effect was only seen when the monkeys were looking at photographs of high-status males. When they looked at pictures of low-status males, or females, the length of the serotonin transporter gene made no difference. In other words, genetic variation seems to underlie social behavior. The same genetic variation causes increased levels of anxiety in humans, and increased anxiety-like behavior in monkeys. Despite this success, however, there is still a long way to go. For example, medication for the treatment of anxiety disorders is still not always successful. But with continuing research, scientists hope to develop better treatments for people suffering from anxiety disorders.

I. These findings in animals correlate with human data about anxiety. People with anxiety disorders typically avoid situations in which they might be judged by others, suggesting that social status plays a key role. The fact that these patterns can be seen in animals, and are linked to genetics, shows that they are not purely learned behaviors, but have a biological basis."""

PASSAGE_3 = """The Myth of the Five Senses

A. Ask any child how many senses they have, and the answer will likely be five: sight, hearing, touch, smell, and taste. It's a concept that has been drilled into our heads since we were young, and it comes from Aristotle's work De Anima (On the Soul), written more than 2,000 years ago. But is this list really complete? Many modern scientists believe that we actually have many more senses than just five.

B. Consider the case of a man who was blind from birth. He learned to read using Braille (a system of raised dots) with his fingers. But researchers wanted to see if he could learn to read another way. They attached a device to his tongue that converted the printed words from a book into electrical signals. After training, the man learned to read by feeling the patterns of electrical signals on his tongue! This remarkable story shows that the traditional boundaries between our senses are not as rigid as we once thought.

C. So what other senses might we have? Two important ones that Aristotle missed are the kinesthetic sense and the vestibular sense. The kinesthetic sense tells you where your body parts are in relation to each other. For example, right now you know where your feet are without having to look at them. This is because you have special sensors in your muscles and joints that constantly send information to your brain about the position and movement of your limbs.

D. The vestibular sense is your sense of balance and spatial orientation. It tells you which way is up and whether you're moving or staying still. This sense comes from your inner ear, where tiny organs detect the movement of fluid when you move your head. Without this sense, you would have trouble walking, standing, or even sitting upright.

E. Why did Aristotle leave these senses off his list? One reason may be that these senses lack a single, identifiable sense organ that exists outside the body, like eyes or ears. The kinesthetic and vestibular senses are internal – we can't point to them the way we can point to our nose or tongue. Another reason may be that these senses work so automatically that we're rarely aware of them. We only notice them when something goes wrong, such as when we lose our balance or when an injury affects our movement.

F. Beyond these two, researchers have identified several other candidate senses. Many animals have senses that humans don't have. For instance, many birds can sense the Earth's magnetic field and use it for navigation during migration. Sharks can detect electrical fields in the water. Bats use echolocation – they emit high-pitched sounds and listen to the echoes to navigate and hunt. The study of these animal abilities has helped expand our understanding of what constitutes a sense.

G. Some researchers believe that humans may have once had more senses than we do now. For example, we may have had a more developed vomeronasal organ (VNO), which in many animals detects pheromones – chemical signals that convey information between members of the same species. While humans still have a small VNO, most scientists believe it is vestigial, meaning it has lost its original function through evolution.

H. Perhaps the most intriguing is what some researchers call "intuition" – the ability to know something without conscious reasoning. While this is controversial and not accepted by all scientists, some research suggests that our bodies can detect and respond to information in our environment before our conscious minds are aware of it. For example, studies have shown that people sometimes have physiological responses (like increased heart rate) to images they're about to see, even before they see them. Is this a real sense, or just statistical noise in the data? The debate continues.

Whatever the final count, it's clear that Aristotle's list of five senses is incomplete. The reality is far more complex and fascinating than we learned in elementary school."""

async def init_reading_test():
    """Initialize IELTS Reading Practice Test 1 if it doesn't exist"""
    
    # Check if exam already exists
    existing_exam = await db.exams.find_one({"id": READING_EXAM_ID})
    
    if existing_exam:
        print(f"✓ IELTS Reading Practice Test 1 already exists (ID: {READING_EXAM_ID})")
        return
    
    print("Creating IELTS Reading Practice Test 1...")
    
    now = get_timestamp()
    
    # Create exam
    exam_data = {
        "id": READING_EXAM_ID,
        "_id": READING_EXAM_ID,
        "title": "IELTS Reading Practice Test 1",
        "description": "Complete IELTS Academic Reading test with 3 passages and 40 questions. Duration: 60 minutes.",
        "exam_type": "reading",  # NEW FIELD to distinguish from listening
        "audio_url": None,  # No audio for reading test
        "audio_source_method": None,
        "loop_audio": False,
        "duration_seconds": 3600,  # 60 minutes
        "published": True,
        "created_at": now,
        "updated_at": now,
        "is_demo": False,
        "question_count": 40,
        "submission_count": 0,
        "is_active": False,
        "started_at": None,
        "stopped_at": None,
        "is_visible": True,
    }
    
    await db.exams.insert_one(exam_data)
    
    # Create 3 sections (one for each reading passage)
    sections = []
    passages = [PASSAGE_1, PASSAGE_2, PASSAGE_3]
    passage_titles = ["The Mozart Effect", "Fears", "The Myth of the Five Senses"]
    
    for i in range(1, 4):
        section_id = f"{READING_EXAM_ID}-section-{i}"
        section = {
            "id": section_id,
            "_id": section_id,
            "exam_id": READING_EXAM_ID,
            "index": i,
            "title": f"Passage {i}: {passage_titles[i-1]}",
            "passage_text": passages[i-1],  # NEW FIELD for reading passages
        }
        sections.append(section)
        await db.sections.insert_one(section)
    
    # PASSAGE 1 (Questions 1-13): The Mozart Effect
    
    # Questions 1-5: Matching Paragraphs to Information
    matching_questions_1 = [
        {"index": 1, "prompt": "A description of how music affects the brain development of infants", "answer_key": "A"},
        {"index": 2, "prompt": "Public's first reaction to the discovery of the Mozart Effect", "answer_key": "G"},
        {"index": 3, "prompt": "The description of Rauscher's original experiment", "answer_key": "B"},
        {"index": 4, "prompt": "The description of using music for healing in other countries", "answer_key": "A"},
        {"index": 5, "prompt": "Other qualities needed in all learning", "answer_key": "F"},
    ]
    
    for q_data in matching_questions_1:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[0]["id"],
            "index": q_data["index"],
            "type": "matching_paragraphs",
            "payload": {
                "prompt": q_data["prompt"],
                "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 6-8: Sentence Completion
    sentence_completion_1 = [
        {"index": 6, "prompt": "During the experiment conducted by Frances Rauscher, subjects were exposed to the music for a _____ period of time before they were tested.", "max_words": 1, "answer_key": "short"},
        {"index": 7, "prompt": "And Rauscher believes the enhancement in their performance is related to the _____, non-repetitive nature of Mozart's music.", "max_words": 1, "answer_key": "complex"},
        {"index": 8, "prompt": "Later, a similar experiment was also repeated on _____.", "max_words": 1, "answer_key": "rats"},
    ]
    
    for q_data in sentence_completion_1:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[0]["id"],
            "index": q_data["index"],
            "type": "sentence_completion",
            "payload": {
                "prompt": q_data["prompt"],
                "max_words": q_data["max_words"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 9-13: True/False/Not Given
    true_false_1 = [
        {"index": 9, "prompt": "All kinds of music can enhance one's brain performance to somewhat extent.", "answer_key": "NOT GIVEN"},
        {"index": 10, "prompt": "There is no neural connection made when a baby is born.", "answer_key": "FALSE"},
        {"index": 11, "prompt": "There are very few who question the Mozart Effect.", "answer_key": "FALSE"},
        {"index": 12, "prompt": "Michael Linton conducted extensive research on Mozart's life.", "answer_key": "FALSE"},
        {"index": 13, "prompt": "There is not enough evidence in support of the Mozart Effect today.", "answer_key": "TRUE"},
    ]
    
    for q_data in true_false_1:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[0]["id"],
            "index": q_data["index"],
            "type": "true_false_not_given",
            "payload": {
                "prompt": q_data["prompt"],
                "options": ["TRUE", "FALSE", "NOT GIVEN"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # PASSAGE 2 (Questions 14-27): Fears
    
    # Questions 14-18: Matching Paragraphs to Information
    matching_questions_2 = [
        {"index": 14, "prompt": "Classification of responses to fear.", "answer_key": "C"},
        {"index": 15, "prompt": "Face of high-status males cause greater fear in the S/L monkey.", "answer_key": "G"},
        {"index": 16, "prompt": "Facial expressions contain social information.", "answer_key": "F"},
        {"index": 17, "prompt": "Fear is not a simple emotion.", "answer_key": "E"},
        {"index": 18, "prompt": "Medicine does not work in some cases.", "answer_key": "D"},
    ]
    
    for q_data in matching_questions_2:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[1]["id"],
            "index": q_data["index"],
            "type": "matching_paragraphs",
            "payload": {
                "prompt": q_data["prompt"],
                "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 19-22: Short Answer (Max 3 Words)
    short_answer_2 = [
        {"index": 19, "prompt": "What do humans and animals differ while they share the similar physiological and psychological developmental stages?", "max_words": 3, "answer_key": "time span"},
        {"index": 20, "prompt": "What reaction did the monkey start with when they were gazed at expressionless?", "max_words": 3, "answer_key": "defensive aggression"},
        {"index": 21, "prompt": "How many preadolescent monkeys became aggressive when they were facing domination from another member of their own species?", "max_words": 3, "answer_key": "95 percent"},
        {"index": 22, "prompt": "According to the passage, what determines social behavior in both humans and monkeys?", "max_words": 3, "answer_key": "genetic variation"},
    ]
    
    for q_data in short_answer_2:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[1]["id"],
            "index": q_data["index"],
            "type": "short_answer_reading",
            "payload": {
                "prompt": q_data["prompt"],
                "max_words": q_data["max_words"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 23-27: Sentence Completion
    sentence_completion_2 = [
        {"index": 23, "prompt": "In order to understand the brain processes that cause _____ in people, and how genetic variation might influence social behavior, scientists first conducted three experiments to gain more insight into fear in monkeys.", "max_words": 3, "answer_key": "anxiety disorders"},
        {"index": 24, "prompt": "For both human and monkeys, _____ can convey social information.", "max_words": 3, "answer_key": "faces and eyes"},
        {"index": 25, "prompt": "It was found that monkeys with one copy of the short gene were less likely to look at the face of a _____ and to take a risk.", "max_words": 3, "answer_key": "high-status male"},
        {"index": 26, "prompt": "The monkey without a _____ would sight on dominant males if they were rewarded.", "max_words": 3, "answer_key": "short gene"},
        {"index": 27, "prompt": "while the _____ monkeys waived the reward.", "max_words": 3, "answer_key": "L/L"},
    ]
    
    for q_data in sentence_completion_2:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[1]["id"],
            "index": q_data["index"],
            "type": "sentence_completion",
            "payload": {
                "prompt": q_data["prompt"],
                "max_words": q_data["max_words"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # PASSAGE 3 (Questions 28-40): The Myth of the Five Senses
    
    # Questions 28-32: Matching Paragraphs to Information
    matching_questions_3 = [
        {"index": 28, "prompt": "Practices of animal migration have helped expand our knowledge of the senses.", "answer_key": "F"},
        {"index": 29, "prompt": "The subject caught the ball with the help of his tongue.", "answer_key": "B"},
        {"index": 30, "prompt": "The brain knows where my right foot is without looking at it.", "answer_key": "D"},
        {"index": 31, "prompt": "An example showing that people's intuition may work.", "answer_key": "H"},
        {"index": 32, "prompt": "Humans probably lost a kind of sensory organ during evolution.", "answer_key": "G"},
    ]
    
    for q_data in matching_questions_3:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[2]["id"],
            "index": q_data["index"],
            "type": "matching_paragraphs",
            "payload": {
                "prompt": q_data["prompt"],
                "options": ["A", "B", "C", "D", "E", "F", "G", "H"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 33-37: Sentence Completion (Word List)
    word_list_options = ["initial", "placement", "sensory organs", "limb", "entrain", "tongue", "movement", "stability", "representation", "dark", "muscles", "picture", "current"]
    sentence_completion_word_list = [
        {"index": 33, "prompt": "Many scientists believe that our _____ list of senses lacks other important elements, like the sense of kinesthetic and vestibular.", "answer_key": "current"},
        {"index": 34, "prompt": "For the first itself, majority cases are about the _____ of our arms and legs.", "answer_key": "limb"},
        {"index": 35, "prompt": "For example, we can feel our feet without looking for them, due to the information link between brain and our _____.", "answer_key": "muscles"},
        {"index": 36, "prompt": "For the vestibular sense, it would provide us with _____.", "answer_key": "stability"},
        {"index": 37, "prompt": "That these two senses are excluded from our list might be the result of a lack of external _____.", "answer_key": "representation"},
    ]
    
    for q_data in sentence_completion_word_list:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[2]["id"],
            "index": q_data["index"],
            "type": "sentence_completion_wordlist",
            "payload": {
                "prompt": q_data["prompt"],
                "word_list": word_list_options,
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    # Questions 38-40: True/False/Not Given
    true_false_3 = [
        {"index": 38, "prompt": "Senses are transposable just as the tongue can also be used to hear sounds.", "answer_key": "FALSE"},
        {"index": 39, "prompt": "Animals are considered to have senses other than the original five.", "answer_key": "TRUE"},
        {"index": 40, "prompt": "New stories and research have persuaded us to accept the conception of five senses.", "answer_key": "FALSE"},
    ]
    
    for q_data in true_false_3:
        question_id = f"{READING_EXAM_ID}-q{q_data['index']}"
        question = {
            "id": question_id,
            "_id": question_id,
            "exam_id": READING_EXAM_ID,
            "section_id": sections[2]["id"],
            "index": q_data["index"],
            "type": "true_false_not_given",
            "payload": {
                "prompt": q_data["prompt"],
                "options": ["TRUE", "FALSE", "NOT GIVEN"],
                "answer_key": q_data["answer_key"]
            },
            "marks": 1,
            "created_by": "system",
            "is_demo": False,
        }
        await db.questions.insert_one(question)
    
    print(f"✅ IELTS Reading Practice Test 1 created successfully!")
    print(f"Exam ID: {READING_EXAM_ID}")
    print(f"Duration: 60 minutes")
    print(f"Total Questions: 40")
    print(f"Passages: 3")

if __name__ == "__main__":
    asyncio.run(init_reading_test())
