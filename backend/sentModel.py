import torch
import warnings
warnings.filterwarnings('ignore') 
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import re, gc, nltk
from lime.lime_text import LimeTextExplainer
from nltk.corpus import stopwords

nltk.data.path.append("./nltk_data")
english_stopwords = set(stopwords.words("english"))

model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=3)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

class sentModel():
    def predict_proba(self, text: str):
        inputs = tokenizer(text, truncation=True, max_length=100, padding='max_length', return_tensors="pt")
        inputs.to(device)
        
        model.eval()
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1).cpu().numpy()

        del inputs, outputs, logits
        torch.cuda.empty_cache()
        gc.collect()
        
        return probabilities

    def sentence_cleaner(self, text):
        pattern = r'http[s]?://\S+'
        text = re.sub(pattern, '', text)
        text = re.sub(r'[\d]+', '', text)
        text = re.sub(r'\b\w{1,2}\b', '', text)
        text = re.sub(r'\b(lol|omg|wtf)\b', '', text)
        text = re.sub(r'\b(Inc|Ltd|Co|Corp|LLC|PLC|AG|GmbH|SA|NV)\b', '', text)
        text = re.sub(r'[\.\!\?,;:\"\'\-\(\)\[\]\{\}\`\$]', '', text)
        text = text.lower()
        text = ' '.join(word for word in text.split() if word not in english_stopwords)
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def run_score(self, text, num_features=10):
        pos_dict = {}
        neg_dict = {}

        instance_text = self.sentence_cleaner(text)
        explainer = LimeTextExplainer(class_names=['Negative', 'Neutral', 'Positive']) 
        
        exp = explainer.explain_instance(
            text_instance=instance_text,
            classifier_fn=lambda x: self.predict_proba(x),
            num_samples=100,
            num_features=num_features
        )

        probabilities = self.predict_proba(instance_text)[0]
        total_score = probabilities[2] - probabilities[0]
        sent_label = ['Negative', 'Neutral', 'Positive'][probabilities.argmax()]
    
        for word, score in exp.as_list():
            if score > 0:
                pos_dict[word] = {'score': score}
            elif score < 0:
                neg_dict[word] = {'score': score}

        return (total_score, sent_label, pos_dict, neg_dict)