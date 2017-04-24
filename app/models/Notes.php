<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Notes extends Model
{
    public $id;
    public $note;
    public $day;
    public $counter;
    public $calendar_id;
    private $created;
    private $modified;

    public function initialize() {

    }


    public function beforeCreate() {
        $this->created = date('Y-m-d H:i:s');
        $this->modified = date('Y-m-d H:i:s');
    }

    public function beforeUpdate() {
        $this->modified = date('Y-m-d H:i:s');
    }

}
