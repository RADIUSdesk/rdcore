<?php
//----------------------------------------------------------
//---- Author: Dirk van der Walt
//---- License: GPL v3
//---- Description: A component that is used to genarate intuative voucher values
//---- Date: 08-05-2017
//------------------------------------------------------------

namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\ORM\TableRegistry;

class VoucherGeneratorComponent extends Component {

    private $nameType		= 'adjective_noun'; 
    
    private $startNumber   = '00001';

    private $wordPool 		= array(
		'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'her',
		'was', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'fig',
		'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'its', 'let', 'fin',
		'put', 'say', 'she', 'too', 'use', 'dad', 'mom', 'try',	'why', 'act', 'bar',
		'car', 'dew', 'eat', 'far', 'gym', 'hey', 'ink', 'jet',	'key', 'log', 'mad',
		'nap', 'odd', 'pal', 'ram',	'saw', 'tan', 'urn', 'vet', 'wed', 'yap', 'zoo',
		'win', 'wax', 'tee', 'tin', 'til', 'tel', 'sit', 'sin', 'rim', 'red', 'rye',
		'pin', 'pix', 'pad', 'pen', 'off', 'map', 'mas', 'lay', 'lin', 'lox', 'low',
		'kin', 'hod', 'ego', 'dog', 'die', 'dam', 'dig', 'dim', 'cat', 'cot', 'com',  
	);

	private $adjectives		= array(
		'large',	'small',	'long',		'short',	'thick',	'narrow',	'deep',
		'flat',		'whole',	'low',		'high',		'near',		'far',		'moving',
		'speed',	'fast',		'quick',	'slow',		'early',	'late',		'sky',
		'bright',	'dark',		'cloudy',	'heat',		'warm',		'cool',		'cold',
		'wind',		'windy',	'noisy',	'loud',		'quiet',	'water',	'fire',
		'earth',	'dry',		'wet',		'clear',	'thing',	'hard',		'soft',
		'heavy',	'light',	'strong',	'weak',		'clean',	'tidy',		'clean',
		'dirty',	'empty',	'full',		'close',	'living',	'thirsty',	'hungry',
		'fresh',	'dead',		'healthy',	'taste',	'sweet',	'sour',		'bitter',
		'salty',	'value',	'good',		'bad',		'great',	'important','useful',
		'price',	'expensive','cheap',	'free',		'power',	'difficult','strong',
		'weak',		'able',		'rich',		'brave',	'fine',		'sad',		'proud',
		'happy',	'liked',	'clever',	'famous',	'exciting',	'funny',	'team',
		'kind',		'polite',	'fair',		'share',	'work',		'busy',		'lucky',
		'well',		'safe',		'careful',	'back',		'bad',		'baggy',	'bare',
		'barren',	'basic',	'beloved',	'calm',		'candid',	'capital',	'careful',
		'careless',	'caring',	'charming',	'damaged',	'damp',		'dangerous','dapper',
		'daring',	'dark',		'darling',	'dazzling',	'dead',		'deadly',	'dear',
		'dearest',	'eager',	'early',	'earnest',	'easy',		'fabulous',	'faint',
		'fair',		'fake',		'famous',	'fancy',	'fantastic','far',		'general',
		'generous',	'gentle',	'giant',	'giddy',	'gigantic',	'hairy',	'half',
		'handy',	'happy',	'hard',		'icky',		'icy',		'ideal',	'idiotic',
		'idle',		'idolized',	'ignorant',	'ill',		'illegal',	'jaded',	'jagged',
		'keen',		'lame',		'lanky',	'large',	'last',		'lavish',	'lawful',
		'mad',		'majestic',	'major',	'mammoth',	'married',	'marvelous','naive',
		'narrow',	'nasty',	'natural',	'naughty',	'obedient',	'obese',	'oblong',
		'obvious',	'oily',		'pale',		'paltry',	'parched',	'partial',	'past',
		'pastel',	'peaceful',	'peppery',	'perfect',	'perfumed',	'quaint',	'radiant',
		'ragged',	'rapid',	'rare',		'rash',		'raw',		'recent',	'reckless',
		'sad',		'safe',		'salty',	'same',		'sandy',	'sane',		'scaly',
		'scared',	'scary',	'scented',	'scholarly','scientific','scornful','scratchy',
		'scrawny',	'second',	'secret',	'selfish',	'tall',		'tame',		'tan',
		'tart',		'tasty',	'taut',		'tedious',	'teeming',	'ultimate',	'vain',
		'valid',	'warm',		'warped',	'wary',		'watchful',	'wavy',		'yawning',
		'yearly',	'zany',		'false',	'active',	'actual',	'adept',	'afraid',
		'aged',		'best',		'better',	'bewitched','big',		'bitter',	'black',
		'cheap',	'cheerful',	'cheery',	'chief',	'chilly',	'chubby',	'circular',
		'classic',	'clean',	'clear',	'clearcut',	'clever',	'close',	'closed',
		'decent',	'decimal',	'deep',		'delayed',	'delicious','elaborate','elastic',
		'elated',	'electric',	'elegant',	'fast',		'fatal',	'fatherly',	'favorable',
		'favorite',	'fearful',	'fearless',	'feisty',	'feline',	'few',		'fickle',
		'gifted',	'giving',	'glamorous','glaring',	'glass',	'gleeful',	'harmless',
		'harmonious','harsh',	'hasty',	'hateful',	'haunting',	'jealous',	'key',
		'kind',		'lazy',		'leading',	'leafy',	'lean',		'left',		'legal',
		'light',	'massive',	'mature',	'meager',	'mealy',	'mean',		'measly',
		'meaty',	'medical',	'mediocre',	'nautical',	'near',		'neat',		'needy',
		'odd',		'oddball',	'offbeat',	'offensive','official',	'old',		'perky',
		'pesky',	'petty',	'phony',	'physical',	'piercing',	'pink',		'pitiful',
		'plain',	'ready',	'real',		'red',		'reflecting','regal',	'regular',
		'separate',	'serene',	'serious',	'serpentine','several',	'severe',	'shabby',
		'shadowy',	'shady',	'shallow',	'shameful',	'shameless','sharp',	'shimmering',
		'shiny',	'shocked',	'shocking',	'shoddy',	'short',	'shortterm','showy',
		'shrill',	'shy',		'sick',		'silent',	'silky',	'tempting',	'tender',
		'tense',	'tepid',	'terrific',	'testy',	'thankful',	'that',		'these',
		'uneven',	'unfit',	'unfolded',	'uniform',	'vast',		'velvety',	'weak',
		'wealthy',	'weary',	'webbed',	'weekly',	'weepy',	'weighty',	'weird',
		'welcome',	'yellow',	'zealous'
	);

	private $nouns		= array(
		'crime',	'mitten',	'lace',		'ghost',	'grain',	'aftermath','tramp',
		'badge',	'snow',		'way',		'yam',		'page',		'rabbit',	'building',
		'brake',	'view',		'reason',	'agreement','cakes',	'dress',	'actor',
		'playground','van',		'pet',		'expansion','slip',		'sun',		'river',
		'pleasure',	'knife',	'quill',	'quiet',	'debt',		'hope',		'nerve',
		'hose',		'dinner',	'mountain',	'chance',	'fuel',		'plot',		'memory',
		'cart',		'bulb',		'produce',	'wheel',	'soap',		'addition',	'train',
		'place',	'cook',		'work',		'giraffe',	'trousers',	'doctor',	'meat',
		'clam',		'visitor',	'profit',	'bite',		'rain',		'fact',		'wine',
		'sky',		'reward',	'size',		'toothbrush','butter',	'statement','ray',
		'experience','zinc',	'side',		'stage',	'error',	'guide',	'writing',
		'quartz',	'stranger',	'pin',		'need',		'payment',	'roll',		'circle',
		'flavor',	'machine',	'fear',		'sticks',	'belief',	'fireman',	'tent',
		'trouble',	'trains',	'juice',	'legs',		'songs',	'form',		'laugh',
		'sponge',	'feeling',	'back',		'scarf',	'car',		'question',	'furniture',
		'arithmetic','lunchroom','temper',	'sail',		'needle',	'waves',	'airport',
		'salt',		'loaf',		'rule',		'meal',		'tub',		'apparel',	'range',
		'quiver',	'scale',	'basket',	'respect',	'chickens',	'unit',		'dad',
		'team',		'order',	'steel',	'birthday',	'horse',	'sleep',	'dinosaurs',
		'ticket',	'plastic',	'kick',		'hour',		'powder',	'fold',		'ocean',
		'tail',		'cherry',	'fall',		'reaction',	'bushes',	'dolls',	'education',
		'line',		'sneeze',	'jelly',	'alarm',	'pancake',	'jellyfish','join',
		'wire',		'jeans',	'number',	'income',	'drink',	'earth',	'hair',
		'bells',	'scissors',	'wind',		'end',		'box',		'instrument','crayon',
		'class',	'trick',	'point',	'boundary',	'potato',	'club',		'pizzas',
		'punishment','curtain',	'war',		'cabbage',	'morning',	'chicken',	'shelf',
		'smash',	'growth',	'crow',		'purpose',	'price',	'sort',		'geese',
		'aunt',		'cast',		'skate',	'kitty',	'letters',	'flowers',	'noise',
		'boy',		'push',		'yard',		'connection','shop',	'brother',	'industry',
		'eyes',		'girl',		'flock',	'turn',		'vein',		'flight',	'cap',
		'thrill',	'roof',		'meeting',	'throat',	'bikes',	'stove',	'houses',
		'flesh',	'carpenter','self',		'pies',		'transport','shape',	'notebook',
		'creator',	'sink',		'truck',	'quilt',	'marble',	'bike',		'berry',
		'branch',	'part',		'middle',	'throne',	'cream',	'straw',	'rat',
		'spiders',	'sleet',	'balance',	'toy',		'grape',	'play',		'water',
		'bell',		'birth',	'vegetable','pollution','wall',		'tree',		'trade',
		'blood',	'wash',		'humor',	'pear',		'hot',		'show',		'cup',
		'beds',		'day',		'rose',		'foot',		'table',	'doll',		'wave',
		'change',	'bath',		'kiss',		'rings',	'sense',	'snail',	'talk',	
		'note',		'route',	'sisters',	'knee',		'celery',	'sign',		'fish',
		'finger',	'toe',		'sofa',		'store',	'clover',	'spade',	'texture',
		'month',	'grade',	'pigs'
	);

    public $voucherNames	= array(); //We first have an empty list which we'll populate and add to each time we generate a voucher

    public function initialize(array $config){
        $this->controller = $this->_registry->getController();
        $this->Radchecks  = TableRegistry::get('Radchecks'); 
    }

    public function generateVoucher(){

		if($this->nameType == 'word_number_word_number'){
			return $this->_word_number_word_number();
		}
  
		if($this->nameType == 'adjective_noun'){
			return $this->_adjective_noun();
		}

		if($this->nameType == 'random_number'){
			return $this->_random_number();
		}

        if($this->nameType == 'random_alpha_numeric'){
            return $this->_random_alpha_numeric();
        }  
    }
    
    public function generatePassword(){
        return $this->_random_alpha_numeric();
    }
    
    public function generateUsernameForVoucher($prefix, $suffix){
    
        $like_statement = '[0-9][0-9][0-9][0-9][0-9]'; //FIXME if you want the vouchers to hve more numbers also add here
        if($suffix !== ''){
            $like_statement = $like_statement.'@'.$suffix;
        }
        if($prefix !==''){
            $like_statement = $prefix.'-'.$like_statement;
        }    
    
        $q_r = $this->Radchecks->find()
            ->where(['Radchecks.username REGEXP' => $like_statement])
            ->order(['Radchecks.username' => 'DESC'])
            ->first();
        if($q_r){
            $username = $q_r->username;
            $username = preg_replace('/^\w+-/', '', $username);//Remove prefix
            $username = preg_replace('/@\w+$/', '', $username);//Remove sufix
            $next_number = (int)$username+1;
            $next_number = sprintf('%05d', $next_number);
        }else{ 
            $next_number = $this->startNumber;
        }
        
        if($suffix !== ''){
            $next_number = $next_number.'@'.$suffix;
        }
        
        if($prefix !==''){
            $next_number = $prefix.'-'.$next_number;
        }
        return $next_number;
    }

    private function _word_number_word_number(){

        $duplicate_flag = true;
		while($duplicate_flag){		
			//Generate a value
			$pool_count = (count($this->wordPool)-1);
			$d1 		= rand (1,9);
			$d2 		= rand (1,9);
			$w1			= rand(0,$pool_count);
			$w2			= rand(0,$pool_count);
			$v_value 	= $this->wordPool[$w1].$d1.$this->wordPool[$w2].$d2;
			//Test if not already taken
			if(!in_array("v_value", $this->voucherNames)){
				$duplicate_flag = false; //Break the loop - we ar unique;
				array_push($this->voucherNames, $v_value);
			}
		}
		return $v_value; //We are unique and we added ourselves to the existing list
    }

	private function _adjective_noun(){

        $duplicate_flag = true;
		while($duplicate_flag){		
			//Generate a value
			$adjective_count= (count($this->adjectives)-1);
			$noun_count     = (count($this->nouns)-1);
			$a				= rand(0,$adjective_count);
			$n				= rand(0,$noun_count);
			$v_value 	    = $this->adjectives[$a].$this->nouns[$n];
			//Test if not already taken
			if(
				(!in_array("v_value", $this->voucherNames))&&
				(strlen($v_value)<=16) //Coova does not like passwords longer than 16 Characters
			){
				$duplicate_flag = false; //Break the loop - we ar unique;
				array_push($this->voucherNames, $v_value);
			}
		}
		return $v_value; //We are unique and we added ourselves to the existing list
    }

	private function _random_number(){
		$duplicate_flag = true;
		while($duplicate_flag){		
			$v_value = rand ( 1000,999999);
			if(!in_array("v_value", $this->voucherNames)){
				$duplicate_flag = false; //Break the loop - we ar unique;
				array_push($this->voucherNames, $v_value);
			}
		}
		return $v_value; //We are unique and we added ourselves to the existing list
	}

    private function _random_alpha_numeric($length = 6){
        // start with a blank password
        $v_value = "";
        // define possible characters
       // $possible = "!#$%^&*()+=?0123456789bBcCdDfFgGhHjJkmnNpPqQrRstTvwxyz";
        $possible = "0123456789bBcCdDfFgGhHjJkmnNpPqQrRstTvwxyz";
        // set up a counter
        $i = 0; 
        // add random characters to $password until $length is reached
        while ($i < $length) { 
            // pick a random character from the possible ones
            $char = substr($possible, mt_rand(0, strlen($possible)-1), 1);
            // we don't want this character if it's already in the password
            if (!strstr($v_value, $char)) { 
                $v_value .= $char;
                $i++;
            }
        }
        return $v_value;
    }

}
