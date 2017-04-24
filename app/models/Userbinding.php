<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Userbinding extends Model
{
    public $id;
    public $user_id;
    public $calendar_id;

    public function initialize() {
        $this->belongsTo("calendar_id", "Calendar", "id");
        $this->belongsTo("user_id", "Users", "id");
    }


}
