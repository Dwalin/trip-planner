<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Log extends Model
{
    public $id;
    public $user;
    public $action;
    public $url;


    public function initialize()
    {

    }

}
