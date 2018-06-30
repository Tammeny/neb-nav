"use strict";

//构造函数，创建数据结构
var NasLinkContract = function() {
    //域名
    LocalContractStorage.defineMapProperty(this, "Card");
    LocalContractStorage.defineProperty(this, "CardCount");
    LocalContractStorage.defineMapProperty(this, "CardIndex");

    //网站名字
    LocalContractStorage.defineMapProperty(this, "CardName");
    LocalContractStorage.defineProperty(this, "CardNameCount");
    LocalContractStorage.defineMapProperty(this, "CardNameIndex");
    LocalContractStorage.defineMapProperty(this, "CardNameCard");

    //网站域名
    LocalContractStorage.defineMapProperty(this, "CardDomain");
    LocalContractStorage.defineProperty(this, "CardDomainCount");
    LocalContractStorage.defineMapProperty(this, "CardDomainIndex");
    LocalContractStorage.defineMapProperty(this, "CardDomainCard");

    //类型
    LocalContractStorage.defineMapProperty(this, "CardType");
    LocalContractStorage.defineProperty(this, "CardTypeCount");
    LocalContractStorage.defineMapProperty(this, "CardTypeIndex");
    LocalContractStorage.defineMapProperty(this, "CardTypeCard");

    //当前用户的域名
    LocalContractStorage.defineMapProperty(this, "MyCardCount");
    LocalContractStorage.defineMapProperty(this, "MyCardIndex");

    //管理员钱包地址
    LocalContractStorage.defineProperty(this, "admin");
};

//原型，存放智能合约方法
NasLinkContract.prototype = {
    init: function() {
        this.CardCount = 0;
        this.CardNameCount = 0;
        this.CardDomainCount = 0;
        this.CardTypeCount = 0;

        this.admin = "n1G2qdFLkiT77AwjvAZQHg5Evh3o3kFyiUP";
    },
    /**
     * 添加分类，返回分类索引
     * {name:"电子商务", cname: "eCommerce"}
     * return index
     */
    addType: function(type) {
        var user = Blockchain.transaction.from,
            time = Blockchain.transaction.timestamp;

        //只允许管理执行当前方法
        if (user !== this.admin) {
            throw new Error("你无此操作权限！");
        }

        var cname = type.cname;
        //根据别名获取分类信息
        var cardType = this.CardType.get(cname);
        if (!!cardType) {
            //如果是更新，则重新set carType
            if (type.update) {
                cardType.name = type.name;
                this.CardType.set(cname, cardType);
            } else {
                throw new Error("分类已存在！");
            }
            return;
        }
        var index = this.CardTypeCount;

        //给当前type添加其他属性
        type.cardCount = 0;
        type.index = index;
        type.created = time;

        this.CardType.set(cname, type);
        this.CardTypeIndex.set(index, cname);
        this.CardTypeCount += 1;
        return index;
    },

    //获取所有的分类
    allType: function() {
        var count = this.CardTypeCount;
        var result = {
            total: count,
            types: []
        };
        for (var i = count; i--; i >= 0) {
            var cname = this.CardTypeIndex.get(i),
                type = this.CardType.get(cname);
            type && result.types.push(type);
        }
        return result;
    },
    /**
     * 分页获取所有域名
     * limit:限制每页返回的数量
     * offset:从第几页开始获取
     */
    getAllCard: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.CardCount) {
            throw new Error("没有数据啦！");
        }
        if (offset == -1) {
            offset = this.CardCount;
        }
        var result = {
            total: this.CardCount,
            cards: []
        };
        for (var i = 0; i < limit; i++) {
            var index = offset - i - 1;
            if (index < 0) {
                break;
            }
            var hash = this.CardIndex.get(index);
            var card = this.Card.get(hash);
            if(card.isRemove || !card.isReview){
                //如果当前数据被标记过删除或未审核，则将limit+1，保证返回的数据条数 === limit
                limit++;
            }else{
                card && result.cards.push(card);
            }
            if (index == 0) {
                break;
            }
        }
        return result;
    },
    /**
     * 根据分类分页获取域名
     * limit:限制每页返回的数量
     * offset:从第几页开始获取
     */
    getAllCardByType: function(cname, limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        var type = this.CardType.get(cname);
        if (!type) {
            throw new Error("分类不存在！");
        }
        var cardCount = type.cardCount;
        if (offset > cardCount) {
            throw new Error("没有数据啦！");
        }
        if (offset == -1) {
            offset = cardCount;
        }
        var result = {
            total: cardCount,
            cards: []
        };
        for (var i = 0; i < limit; i++) {
            var index = offset - i - 1;
            if (index < 0) {
                break;
            }
            var hash = this.CardTypeCard.get(cname + "_" + index);
            var card = this.Card.get(hash);
            if(card.isRemove || !card.isReview){
                //如果当前数据被标记过删除，则将limit+1，保证返回的数据条数 === limit
                limit++;
            }else{
                card && result.cards.push(card);
            }
            if (index == 0) {
                break;
            }
        }
        return result;
    },
    /**
     * 根据当前用户分页获取域名
     * limit:限制每页返回的数量
     * offset:从第几页开始获取
     */
    getAllCardByUser: function(address, limit, offset) {
        if (!address) {
            address = Blockchain.transaction.from;
        }
        var cardCount = this.MyCardCount.get(address) * 1;
        var result = {
            total: cardCount,
            cards: []
        };
        if (!cardCount) {
            return result;
        }
        if (offset == -1) {
            offset = cardCount;
        }
        for (var i = 0; i < limit; i++) {
            var index = offset - i - 1;
            if (index < 0) {
                break;
            }
            var hash = this.MyCardIndex.get(address + "_" + index);
            var card = this.Card.get(hash);
            card && result.cards.push(card);
            if (index == 0) {
                break;
            }
        }
        return result;
    },
    /**
     * 添加域名
     * detail:域名数据
     */
    addCard: function(detail) {
        var user = Blockchain.transaction.from,
            time = Blockchain.transaction.timestamp,
            hash = Blockchain.transaction.hash;
        var phoneExp = /(^(\d{3,4}-)?\d{7,8})$|(1[0-9]{10})/;
        if (!detail instanceof Object) {
            throw new Error("参数有误");
        }
        if (!phoneExp.test(detail.phone)) {
            //电话号码不正确
            throw new Error("电话号码有误");
        }
        if (detail.introduce < 5 || detail.introduce > 1000) {
            //请输入5~1000个字
            throw new Error("请输入5~1000个字");
        }
        //通过分类id获取分类名称
        var type = this.CardType.get(detail.type);
        if (!type) {
            throw new Error("分类不存在");
        }
        var Card = {
            hash: hash,
            name: detail.name,
            email: detail.email,
            ip: detail.ip,
            domain: detail.domain,
            introduce: detail.introduce,
            phone: detail.phone,
            created: time,
            author: user,
            type: detail.type,
            icon: detail.icon,
            index: this.CardCount
        };

        //保存用户提交的域名信息
        this.Card.set(hash, Card);
        //将索引值与hash对应起来，方便通过索引查找指定的Card
        this.CardIndex.set(this.CardCount, hash);
        this.CardCount += 1;

        //将分类作为key存起来，供筛选使用
        var cname = type.cname;
        this.CardTypeCard.set(cname + "_" + type.cardCount, hash);
        type.cardCount += 1;
        this.CardType.set(cname, type);

        //设置我的域名
        var myCardCount = this.MyCardCount.get(user) * 1;
        this.MyCardCount.set(user, myCardCount + 1);
        this.MyCardIndex.set(user + "_" + myCardCount, hash);

        var result = {
            hash: hash
        };
        return result;
    },
    /**
     * 审核域名，只有当前用户及admin才可审核
     * hash:域名hash
     */
    reviewCard: function(hash){
        var user = Blockchain.transaction.from;
        var card = this.Card.get(hash);
        if(card){
            if(user !== this.admin){
                throw new Error("无权操作！");
            }
            card.isReview = true;
            this.Card.set(hash, card);
        }else{
            throw new Error("数据不存在！");
        }
    },
    /**
     * 软删除域名，只有当前用户及admin才可删除
     * hash:域名hash
     */
    removeCard: function(hash){
        var user = Blockchain.transaction.from;
        var card = this.Card.get(hash);
        if(card){
            if(user !== card.author && user !== this.admin){
                throw new Error("无权操作！");
            }
            card.isRemove = true;
            this.Card.set(hash, card);
        }else{
            throw new Error("数据不存在！");
        }
    }
};

module.exports = NasLinkContract;
