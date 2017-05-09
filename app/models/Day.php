<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Day extends Model
{
    public $id;
    public $name;
    public $date;
    private $created;
    private $modified;

    public function initialize() {


        $this->belongsTo(
            "stop_id",
            "Stop",
            "id"
        );

        $this->hasMany(
            "id",
            "Plan",
            "plan_id"
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
