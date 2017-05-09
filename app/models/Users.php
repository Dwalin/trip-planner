<?php
//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Users extends Model
{
    public $id;
    //public $name;
    public $email;
    public $password;

    public function initialize()
    {
        $this->hasManyToMany(
            "id",
            "Userbinding",
            "user_id", "trip_id",
            "Trip",
            "id"
        );
    }

}

