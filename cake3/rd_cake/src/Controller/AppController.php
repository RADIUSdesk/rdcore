<?php
/**
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link      http://cakephp.org CakePHP(tm) Project
 * @since     0.2.9
 * @license   http://www.opensource.org/licenses/mit-license.php MIT License
 */
namespace App\Controller;

use Cake\Controller\Controller;
use Cake\Event\Event;

use Acl\Controller\Component\AclComponent;
use Cake\Controller\ComponentRegistry;

use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;


//FIXME Add this for ExtJS Grid
use Cake\I18n\Time;
use Cake\I18n\FrozenTime;
use Cake\I18n\FrozenDate;
use Cake\I18n\Date;
use Cake\ORM\TableRegistry;

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @link http://book.cakephp.org/3.0/en/controllers.html#the-app-controller
 */
class AppController extends Controller
{

    /**
     * Initialization hook method.
     *
     * Use this method to add common initialization code like loading components.
     *
     * e.g. `$this->loadComponent('Security');`
     *
     * @return void
     */
    protected $parents  = [];
    protected $children = [];

    public $components = [
            'Acl' => [
                'className' => 'Acl.Acl'
            ]
        ]; 
     
    public function initialize()
    {
        parent::initialize();
        
        //Load the Config file we originally always had loaded
        Configure::load('RadiusDesk','default');

        $this->loadComponent('RequestHandler');
        $this->loadComponent('Flash');
        
        
        //==== Quick Hack =====
        $ro_token   = 'f2c404b5-c2d8-4f7a-adfb-fc7aef76fbbb'; //Read Only User
        $switch_to  = 'd9c6a0b0-dde7-451c-b4fc-794d2e5c72bf'; //For User
        if(isset($this->request->query['token'])){
            if($this->request->query['token'] == $ro_token){
                $this->request->query['token'] = $switch_to;
                $session    = $this->getRequest()->getSession();
                $session->write([
                  'Config.act_as'   => $switch_to,
                  'Config.i_am'     => $ro_token,
                ]);   
            }
        }   
        //== END Quick Hack =====
        
        /*
         * Enable the following components for recommended CakePHP security settings.
         * see http://book.cakephp.org/3.0/en/controllers/components/security.html
         */
        //$this->loadComponent('Security');
        //$this->loadComponent('Csrf');
        
        
        //FIXME Add this for ExtJS Grid
        Time::setJsonEncodeFormat('yyyy-MM-dd HH:mm:ss');  // For any mutable DateTime
        FrozenTime::setJsonEncodeFormat('yyyy-MM-dd HH:mm:ss');  // For any immutable DateTime
        Date::setJsonEncodeFormat('yyyy-MM-dd HH:mm:ss');  // For any mutable Date
        FrozenDate::setJsonEncodeFormat('yyyy-MM-dd HH:mm:ss');  // For any immutable Date
        
    }

    /**
     * Before render callback.
     *
     * @param \Cake\Event\Event $event The beforeRender event.
     * @return \Cake\Network\Response|null|void
     */
    public function beforeRender(Event $event)
    {
        if (!array_key_exists('_serialize', $this->viewVars) &&
            in_array($this->response->type(), ['application/json', 'application/xml'])
        ) {
            $this->set('_serialize', true);
        }
    }
    
    protected function _ap_right_check(){
        //This is a common function which will check the right for an access provider on the called action.
        //We have this as a common function but beware that each controlleer which uses it; 
        //have to set the value of 'base' in order for it to work correct.

        $action = $this->request->action;
        //___AA Check Starts ___
        $user = $this->Aa->user_for_token($this);
        if(!$user){   //If not a valid user
            return;
        }
        $user_id = null;
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            $user_id = $user['id'];
        }elseif($user['group_name'] == Configure::read('group.ap')){  //Or AP
            $user_id = $user['id'];
            
            $temp_debug = Configure::read('debug');
           // Configure::write('debug', 0); // turn off debugging
            
            if(!$this->Acl->check(array('model' => 'Users', 'foreign_key' => $user_id), $this->base.$action)){  //Does AP have right?
                Configure::write('debug', $temp_debug); // return previous setting 
                $this->Aa->fail_no_rights($this);
                return;
            }
            
            Configure::write('debug', $temp_debug); // return previous setting 
            
        }else{
           $this->Aa->fail_no_rights($this);
           return;
        }

        return $user;
        //__ AA Check Ends ___
    }

    protected function _test_for_private_parent($item,$user){


        //Most tables that has entries which belongs to an Access Provider as the user_id also includes
        // and available_to_siblings flag which if not set; makes the entry private
        // This piece of code will take the current user making the request; and compare it with fields in an entry from a table
        // It will then evaluate where it is in the hirarchy and is below the item marked as private; not display it
        if($user['group_name'] == Configure::read('group.admin')){  //Admin
            return false;
        }


        if($user['group_name'] == Configure::read('group.ap')){  //AP

            $user_id = $user['id'];
            $owner_id= $item->user_id;
            $open    = $item->available_to_siblings;

            //test for self
            if($owner_id == $user_id){
                return false;
            }

            //Test Parents

            //Check if parents is perhaps empty, then prime it first
            if(count($this->parents) == 0){
//                $u_qry = TableRegistry::get('Users');
                $this->parents = $this->{'Users'}->find('path', ['for' => $user_id, 'fields' => ['Users.id']]);
            }

            //**AP and upward in the tree**
            foreach($this->parents as $i){
                if($i->id == $owner_id){
                    if($open == false){
                        return true; //private item
                    }else{
                        return false;
                    }
                }
            }
        }
    }


    /**
    * This Behavior writes tmp files to take advantage of the built-in fputcsv function.
    *
    */
    protected function ensureTmp() {
        $tmpDir = TMP . $this->tmpDir;
        if ( !file_exists($tmpDir ) ) {
            mkdir( $tmpDir, 0777);
        }
    }


    /**
    * Delete the tmp file, only if $tmp_file lives in TMP directory
    * otherwise throw an Exception
    *
    * @param mixed $tmp_file
    */
    protected function cleanupTmp( $tmp_file='' ) {
        $realpath = realpath( $tmp_file );
         
        if ( substr( $realpath, 0, strlen( TMP ) ) != TMP ) {
            throw new Exception('I refuse to delete a file outside of ' . TMP );
        }
         
        if ( file_exists( $tmp_file ) ) {
            unlink( $tmp_file );
        }
    }

    
}
