<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Plan extends Model
{
    public $id;
    public $name;
    public $complete;
    private $created;
    private $modified;

    public function initialize() {


        $this->belongsTo(
            "day_id",
            "Day",
            "id"
        );

    }


    public function beforeCreate() {
        $this->created = date('Y-m-d H:i:s');
        $this->modified = date('Y-m-d H:i:s');
    }

    public function beforeUpdate() {
        $this->modified = date('Y-m-d H:i:s');
    }

}
